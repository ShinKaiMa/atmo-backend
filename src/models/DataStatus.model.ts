import {Document, Schema, Model, model} from "mongoose";

export interface IDataStatus extends Document {
  source: string;
  fileType: string;
  area:string;
  dataType:string;
  detailType:string;
  path: string;
  status:string;
  byte:number;
  startDate:Date;
  endDate:Date;
  forcastHour:Number;
  incrementHours:number;
  timeStamp: Date;
}

let DataStatusSchema: Schema = new Schema({
  source:{ type: String, required: true , index: true }, //CWB WRF 3KM, GFS, ECMWF
  fileType: { type: String, required: true , index: true}, // IMG, GRB
  area:{ type: String, required: true , index: true}, // East Asia, TW
  dataType:{ type: String, required: true , index: true}, //Precipitation,Wind,Temperature
  detailType:{ type: String , index: true}, // 850hPa Wind & Precip
  path: { type: String, required: true , index: true},
  status: {type: String, required: true , index: true},
  byte: {type: Number, required: true , index: true},
  startDate: {type: Date, required: true , index: true},
  endDate: {type: Date, required: true , index: true},
  forcastHour: {type: Number, required: true , index: true},
  incrementHours: {type: Number, required: true , index: true},
  timeStamp: { type: Date , index: true}
},{collection: 'DataStatus'});

DataStatusSchema.pre<IDataStatus>("save", function (next) {
  if (!this.timeStamp) {
    let now = new Date();
    this.timeStamp = now;
  }
  next();
});

export const DataStatus: Model<IDataStatus> = model<IDataStatus>("DataStatus", DataStatusSchema);