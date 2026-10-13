import jwt from 'jsonwebtoken';
export function requireAuth(req,res,next){try{const token=(req.headers.authorization||'').replace(/^Bearer /,'');const data=jwt.verify(token,process.env.JWT_SECRET);req.user=data;next();}catch{return res.status(401).json({error:'Authentication required'});}}
export function signToken(user){return jwt.sign({id:String(user._id),role:user.role},process.env.JWT_SECRET,{expiresIn:'8h'});}
