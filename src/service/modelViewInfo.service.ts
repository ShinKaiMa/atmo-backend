import { logger } from '../libs/utils/logger';
import { DataStatus, IDataStatus } from "../../src/models/DataStatus.model"

export class ModelViewInfoService {
    public static async listAllInfo(): Promise<string[]> {
        try {
            let distinctArea: IDataStatus[] = await DataStatus.aggregate([
                { $match: { dataType: 'IMG' } },
                { $group: { _id: null, area: { $addToSet: "$area" } } }
            ]);
        } catch (err) {
            logger.error(err);
            return [];
        }
    }
}
