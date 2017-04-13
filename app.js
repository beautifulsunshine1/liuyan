var express=require("express");
var app=express();
var router=require("./controller/router.js");
var session=require("express-session");
//使用session
app.use(session({
	secret:'keyboard cat',
	resave:false,
	saveUninitialized:true
}))
app.set("view engine","ejs");
app.use(express.static("./public"));
app.use(express.static("./avatar"));
app.get("/",router.showIndex);
app.get("/regist",router.showRegist);
app.post("/doregist",router.doRegist);
app.get("/login",router.showLogin);
app.post("/dologin",router.doLogin);
app.get("/setavatar",router.showSetavatar);
app.post("/dosetavatar",router.doSetavatar);
app.get("/cut",router.showCut);
app.get("/docut",router.docut);
app.post("/Post",router.Post);
app.get("/getAllshuoshuo",router.getAllshuoshuo);
app.get("/getuserinfo",router.getuserinfo);
app.get("/getshuoshuocount",router.getshuoshuocount);
app.get("/getusershuoshuo/:user",router.getusershuoshuo);
app.get("/getAlluser",router.getAlluser);
app.get("/showinformation",router.showinformation);
app.post("/setinformation",router.setInformation);
app.listen(3000);