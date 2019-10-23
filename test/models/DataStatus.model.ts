import { DataStatus, IDataStatus } from "../../src/models/DataStatus.model"
import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/test', { useCreateIndex: true, useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', (err) => console.log(err));

db.once('open', async function () {
  // let now = new Date();
  // let OneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // let previuosGRBStatus: IDataStatus[] = await DataStatus.find({ startDate: { $gte: OneWeekAgo, $lte: now } }).exec();
  // console.log(previuosGRBStatus);

  let result: IDataStatus[] = await DataStatus.aggregate([
    { $match: { dataType: 'IMG' } },
    { $group: { _id: null, area: { $addToSet: "$area" } } }
  ]);

  console.log(result)
})