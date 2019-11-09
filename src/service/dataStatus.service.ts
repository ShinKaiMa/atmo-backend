import { DataStatus, IDataStatus } from '../models/DataStatus.model';
import { logger } from '../libs/utils/logger';
import * as dateformat from 'dateformat';

interface modelViewSchema {
    area: string[],
    startDate: string[]
}

export class DataStatusService {
    private static DATA_TYPE_NUM = 4;

    public static async getModelViewSchemaByModelName(modelName: string) {
        try {
            let now = new Date();
            let OneWeekAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            // let OneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            let result: any[] = await DataStatus.aggregate([
                { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: modelName } },
                { $group: { _id: null, area: { $addToSet: "$area" }, startDate: { $addToSet: "$startDate" } } }
            ]);
            if (result && result.length > 0) {
                let modelViewSchema = result[0];
                delete modelViewSchema['_id'];

                modelViewSchema.area = modelViewSchema.area.map(area => {
                    return area.replace('_', ' ');
                });

                modelViewSchema.startDate = modelViewSchema.startDate.map(dateString => {
                    return dateformat(new Date(dateString), "UTC:yyyy/mm/dd HHMMZ");
                });

                //distinct dataTypes (wind, temp, precip) by model name
                let dataTypes = await DataStatus.aggregate([
                    { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: modelName } },
                    { $group: { _id: null, dataTypes: { $addToSet: "$dataType" } } }
                ]);
                console.log(`dataTypes: ${JSON.stringify(dataTypes)}`);
                console.log(`dataTypes[0].dataTypes.length: ${JSON.stringify(dataTypes[0].dataTypes.length)}`);

                if (dataTypes && dataTypes[0].dataTypes && dataTypes[0].dataTypes.length === this.DATA_TYPE_NUM) {
                    // dataTypes[0].dataTypes.forEach(async dataType => {
                    //     //distinct detailTypes (surface wind, 850hPa temp... etc.) by dataType.
                    //     let detailTypes = await DataStatus.aggregate([
                    //         { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: modelName, dataType } },
                    //         { $group: { _id: null, detailTypes: { $addToSet: "$detailType" } } }
                    //     ]);
                    //     console.log(`detailTypes: ${JSON.stringify(detailTypes)}`);
                    //     if (detailTypes && detailTypes[0].detailTypes) {
                    //         modelViewSchema.dataTypes = { ...modelViewSchema.dataTypes, dataTypes: [...dataTypes, { [dataType]: detailTypes }] };
                    //         console.log(`modelViewSchema: ${JSON.stringify(modelViewSchema)}`);
                    //     }
                    // })

                    for(let dataType of dataTypes[0].dataTypes){
                        //distinct detailTypes (surface wind, 850hPa temp... etc.) by dataType.
                        let detailTypesResult = await DataStatus.aggregate([
                            { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source: modelName, dataType } },
                            { $group: { _id: null, detailTypes: { $addToSet: "$detailType" } } }
                        ]);
                        console.log(`detailTypesResult: ${JSON.stringify(detailTypesResult)}`);
                        if (detailTypesResult && detailTypesResult[0].detailTypes) {
                            delete detailTypesResult[0]._id;
                            modelViewSchema.dataTypes = { ...modelViewSchema.dataTypes,  [dataType]: detailTypesResult[0].detailTypes } ;
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