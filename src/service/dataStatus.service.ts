import { DataStatus, IDataStatus } from '../models/DataStatus.model';
import { logger } from '../libs/utils/logger';
import * as dateformat from 'dateformat';

interface modelViewSchema{
    area:string[],
    startDate:string[]
}

export class DataStatusService {
    public static async getModelViewSchemaByModelName(modelName: string) {
        try {
            console.log(`modelName: ${modelName}`);
            let now = new Date();
            let OneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            let result:any[] = await DataStatus.aggregate([
                { $match: { fileType: 'IMG', startDate: { $gte: OneWeekAgo, $lte: now }, source:modelName  } },
                { $group: { _id: null, area: { $addToSet: "$area" }, startDate: { $addToSet: "$startDate" } } }
            ]);
            console.log(`result: ${JSON.stringify(result)}`);
            if (result.length > 0) {
                let modelViewSchema  = result[0];
                delete modelViewSchema['_id'];

                let areas = modelViewSchema.area.map( area => {
                    return area.replace('_',' ');
                });
                modelViewSchema.area = areas;

                let startDates = modelViewSchema.startDate.map( dateString => {
                    return dateformat(new Date(dateString),"UTC:yyyy/mm/dd HH:MM:ss Z");
                });
                modelViewSchema.startDate = startDates;

                return modelViewSchema;
            }
        } catch (err) {
            logger.error(err);
        }
        return null;
    }
}