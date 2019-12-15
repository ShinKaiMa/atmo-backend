import { DataStatus, IDataStatus } from '../models/DataStatus.model';
import { logger } from '../libs/utils/logger';
import * as dotenv from 'dotenv';
import { config } from '../config'
import * as dateformat from 'dateformat';
import * as momet from 'moment';

interface modelViewSchema {
    area: string[],
    startDate: string[]
}

interface weathermapResponse {
    weathermapsInfo?: weathermapInfo[],
    missingFcstHour?: Number[],
    availableFcstHour?: Number[],
    fcstHourIncrement?: number,
    totalFcstHour?: number
}

interface weathermapInfo {
    url: string,
    fcstHour: Number,
}

enum ModelType {
    CWB_WRF_3KM
}

enum ModelTotalFcstHour {
    CWB_WRF_3KM = 84
}

enum ModelFcstHourIncrement {
    CWB_WRF_3KM = 6
}

export class DataStatusService {
    private static DATA_TYPE_NUM = 3; //just hard code to check result correct early

    public static async getModelViewSchemaByAreaAndModelName(model: string, area: string) {
        try {
            let now = new Date();
            let OneWeekAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // just for develope temporarily
            // let OneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            //distinct startDate by model name and area
            let result: any[] = await DataStatus.aggregate([
                { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model, area: area } },
                { $group: { _id: null, startDate: { $addToSet: "$startDate" } } }
            ]);

            if (result && result.length > 0) {
                let modelViewSchema = result[0];
                delete modelViewSchema['_id'];

                modelViewSchema.area = area.replace(/_/g, ' ');

                if (modelViewSchema.startDate.length > 1)
                    modelViewSchema.startDate = modelViewSchema.startDate.sort((previousDate, laterDate) => {
                        return new Date(laterDate).getTime() - new Date(previousDate).getTime();
                    })

                // modelViewSchema.startDate = modelViewSchema.startDate.map(dateString => {
                //     return dateformat(new Date(dateString), "UTC:yyyy/mm/dd HHMMZ");
                // });

                //distinct dataTypes (wind, temp, precip) by model name and area
                let dataTypes = await DataStatus.aggregate([
                    { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model, area: area } },
                    { $group: { _id: null, dataTypes: { $addToSet: "$dataType" } } }
                ]);


                if (dataTypes && dataTypes[0].dataTypes && dataTypes[0].dataTypes.length === this.DATA_TYPE_NUM) {
                    for (let dataType of dataTypes[0].dataTypes) {
                        //distinct detailTypes (surface wind, 850hPa temp... etc.) by dataType.
                        let detailTypesResult = await DataStatus.aggregate([
                            { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model, dataType, area } },
                            { $group: { _id: null, detailTypes: { $addToSet: "$detailType" } } }
                        ]);
                        if (detailTypesResult && detailTypesResult[0].detailTypes) {
                            delete detailTypesResult[0]._id;
                            modelViewSchema.dataTypes = {
                                ...modelViewSchema.dataTypes,
                                [dataType]: detailTypesResult[0].detailTypes.map(detailType => {
                                    return detailType.replace(/_/g, ' ');
                                }
                                )
                            };
                        }
                    }
                    return modelViewSchema;
                }
            }
        } catch (err) {
            logger.error(err);
        }
        return null;
    }


    public static async getAreaByModel(model: string) {
        try {
            let now = new Date();
            let OneWeekAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // just for develope temporarily
            // let OneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            //distinct startDate by model name and area
            let result: any[] = await DataStatus.aggregate([
                { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model } },
                { $group: { _id: null, area: { $addToSet: "$area" } } }
            ]);

            if (result && result.length > 0) {
                let areas = result[0];
                delete areas['_id'];

                let responseJSON = areas.area.map(area => {
                    return area.replace(/_/g, " ");
                });
                console.log(`responseJSON : ${JSON.stringify(responseJSON)}`)
                return responseJSON;
            }
        } catch (e) {
            logger.error(e)
        }
        return null;
    }

    public static async getWeathermap(model: string, area: string, detailType: string, startDateString: string) {
        try {
            area = area.replace(/ /g, "_");
            detailType = detailType.replace(/ /g, "_");
            let targetDate = new Date(startDateString);
            let targetDataStatus: IDataStatus[] = await DataStatus.find(
                { fileType: 'IMG', status: "saved", startDate: { $eq: targetDate }, source: model, area, detailType }
            ).exec();
            if (targetDataStatus && targetDataStatus.length > 0) {
                let weathermapsInfo: weathermapInfo[] = targetDataStatus.map(weathermapDataStatus => {
                    return {
                        url: weathermapDataStatus.path ? weathermapDataStatus.path.replace(process.env.REMOTE_STATIC_IMG_PATH, config.baseURL + config.weathermapRoute) : "",
                        fcstHour: weathermapDataStatus.forcastHour
                    }
                })
                weathermapsInfo.sort((before, after) => {
                    return +before.fcstHour - +after.fcstHour;
                });
                let weathermapResponse:weathermapResponse;
                weathermapResponse = {...weathermapResponse, weathermapsInfo};
                let missingFcstHour = DataStatusService.extractMissingFcstHourFromWeathermapResponse(weathermapsInfo);

                if(missingFcstHour){
                    weathermapResponse.missingFcstHour = missingFcstHour;
                    weathermapResponse.availableFcstHour = weathermapsInfo.map(weathermapInfo => {
                        return weathermapInfo.fcstHour;
                    })

                    let modelName = DataStatusService.guessModelNameByURL(weathermapsInfo[0].url);
                    let totalFcstHour: number = ModelTotalFcstHour[modelName];
                    let fcstHourIncrement: number = ModelFcstHourIncrement[modelName];

                    weathermapResponse = {...weathermapResponse, totalFcstHour, fcstHourIncrement};
                    return weathermapResponse;
                }
            } else {
                return {availableFcstHour:[]};
            }
        } catch (e) {
            logger.error(e);
            return {availableFcstHour:[], error:"Server internal error."};
        }
    }


    private static extractMissingFcstHourFromWeathermapResponse(weathermapsInfo: weathermapInfo[]) {
        if (weathermapsInfo.length > 0) {
            // Get model fcst info
            let modelName = DataStatusService.guessModelNameByURL(weathermapsInfo[0].url);
            let totalFcstHour: number = ModelTotalFcstHour[modelName];
            let fcstHourIncrement: number = ModelFcstHourIncrement[modelName];

            // Get available fcst hour
            let availableFcstHours: Number[] = weathermapsInfo.map(weathermapInfo => {
                return weathermapInfo.fcstHour;
            });

            // Get complete fcst hour
            let completeFcstHours: Number[] = [];
            for (let fcstHour = 0; fcstHour <= totalFcstHour; fcstHour = fcstHour + fcstHourIncrement) {
                completeFcstHours.push(fcstHour);
            }

            //Diff fcst hour
            let missingFcstHour = completeFcstHours.filter(x => !availableFcstHours.includes(x));
            return missingFcstHour;
        } else {
            return null;
        }

    }

    private static guessModelNameByURL(url: string): string {
        if (url) {
            if (url.includes('CWB')) {
                return ModelType[ModelType.CWB_WRF_3KM];
            } else {
                return ModelType[ModelType.CWB_WRF_3KM];
            }
        }
    }
}