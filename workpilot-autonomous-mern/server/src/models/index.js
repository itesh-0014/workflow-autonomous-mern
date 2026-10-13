import mongoose from 'mongoose';
const {Schema,model}=mongoose;
const opts={timestamps:true,versionKey:false};
export const User=model('User',new Schema({email:{type:String,unique:true,required:true},passwordHash:{type:String,required:true},role:{type:String,default:'admin'}},opts));
export const Policy=model('Policy',new Schema({title:String,body:String,tags:[String]},opts));
export const Ticket=model('Ticket',new Schema({subject:String,description:String,customerEmail:String,priority:{type:String,enum:['low','medium','high','critical'],default:'medium'},status:{type:String,enum:['open','in_progress','resolved'],default:'open'},assignee:String},opts));
export const WorkItem=model('WorkItem',new Schema({ticketId:{type:Schema.Types.ObjectId,ref:'Ticket'},runId:{type:Schema.Types.ObjectId,ref:'Run'},title:String,assignee:String,status:{type:String,default:'todo'},idempotencyKey:{type:String,unique:true}},opts));
export const Draft=model('Draft',new Schema({runId:{type:Schema.Types.ObjectId,ref:'Run'},ticketId:{type:Schema.Types.ObjectId,ref:'Ticket'},recipient:String,subject:String,body:String,status:{type:String,enum:['pending','approved','rejected'],default:'pending'},idempotencyKey:{type:String,unique:true}},opts));
export const Run=model('Run',new Schema({owner:{type:Schema.Types.ObjectId,ref:'User'},goal:String,status:{type:String,enum:['queued','running','awaiting_approval','completed','failed'],default:'queued'},plan:[{name:String,tool:String,status:String}],cursor:{type:Number,default:0},attempts:{type:Number,default:0},events:[new Schema({at:{type:Date,default:Date.now},type:String,message:String,data:Schema.Types.Mixed},{_id:false})],context:{type:Schema.Types.Mixed,default:{}},verification:{type:Schema.Types.Mixed,default:null},error:String},opts));
