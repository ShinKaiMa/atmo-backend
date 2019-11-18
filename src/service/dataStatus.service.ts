import { DataStatus, IDataStatus } from '../models/DataStatus.model';
import { logger } from '../libs/utils/logger';
import * as dateformat from 'dateformat';

interface modelViewSchema {
    area: string[],
    startDate: string[]
}

export class DataStatusService {
    private static DATA_TYPE_NUM = 3; //just hard code to check result correct early

    public static async getModelViewSchemaByModelName(model: string, area: string) {
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

                modelViewSchema.area = { area };

                modelViewSchema.startDate = modelViewSchema.startDate.map(dateString => {
                    return dateformat(new Date(dateString), "UTC:yyyy/mm/dd HHMMZ");
                });

                //distinct dataTypes (wind, temp, precip) by model name and area
                let dataTypes = await DataStatus.aggregate([
                    { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model, area: area } },
                    { $group: { _id: null, dataTypes: { $addToSet: "$dataType" } } }
                ]);
                console.log(`dataTypes: ${JSON.stringify(dataTypes)}`);
                console.log(`dataTypes[0].dataTypes.length: ${JSON.stringify(dataTypes[0].dataTypes.length)}`);


                if (dataTypes && dataTypes[0].dataTypes && dataTypes[0].dataTypes.length === this.DATA_TYPE_NUM) {
                    for (let dataType of dataTypes[0].dataTypes) {
                        //distinct detailTypes (surface wind, 850hPa temp... etc.) by dataType.
                        let detailTypesResult = await DataStatus.aggregate([
                            { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: model, dataType } },
                            { $group: { _id: null, detailTypes: { $addToSet: "$detailType" } } }
                        ]);
                        console.log(`detailTypesResult: ${JSON.stringify(detailTypesResult)}`);
                        if (detailTypesResult && detailTypesResult[0].detailTypes) {
                            delete detailTypesResult[0]._id;
                            modelViewSchema.dataTypes = {
                                ...modelViewSchema.dataTypes,
                                [dataType]: detailTypesResult[0].detailTypes.map(detailType => {
                                    return detailType.replace(/_/g, ' ');
                                }
                                )
                            };
                            console.log(`modelViewSchema: ${JSON.stringify(modelViewSchema)}`);
                        }
                    }
                    return modelViewSchema;

                }

            }
        } catch (err) {
            logger.error(err);
            return null;
        }
    }
}