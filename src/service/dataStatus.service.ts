import { DataStatus, IDataStatus } from '../models/DataStatus.model';
import { logger } from '../libs/utils/logger';
import * as dotenv from 'dotenv';
import * as dateformat from 'dateformat';
import * as momet from 'moment';
dotenv.config();

interface modelViewSchema {
    area: string[],
    startDate: string[]
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

                if(modelViewSchema.startDate.length > 1)
                    modelViewSchema.startDate = modelViewSchema.startDate.sort((previousDate,laterDate)=>{
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
                            { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model, dataType } },
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
        console.log(process.env.LOCAL_STATIC_IMG_PATH);
        area = area.replace(/ /g, "_");
        detailType = detailType.replace(/ /g, "_");
        let targetDate = new Date(startDateString);
        let targetDataStatus: IDataStatus[] = await DataStatus.find(
            { fileType: 'IMG', status: "saved", startDate: { $eq: targetDate }, source: model, area, detailType }
        ).exec();
        if(targetDataStatus){
            let weathermapArray = targetDataStatus.map(weathermapDataStatus =>{
                return {url: weathermapDataStatus.path? weathermapDataStatus.path.replace(process.env.LOCAL_STATIC_IMG_PATH,process.env.LOCAL_STATIC_IMG_PATH)}
            })
        }
        return targetDataStatus;
    }
}