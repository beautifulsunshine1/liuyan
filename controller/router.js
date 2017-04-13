var formidable=require("formidable");
var db=require("../models/db.js");
var md5=require("../models/md5.js");
var path=require("path");
var fs=require("fs");
var gm=require("gm");
exports.showIndex=function(req,res,next){
	//检索数据库，查找此人头像
	if(req.session.login=="1"){ 
		db.find("user",{username:req.session.username},function(err,result){
			var avatar=result[0].avatar||"moren.jpg";
			res.render("index",{
	        "login":req.session.login=="1"?true:false,
            "username":req.session.login=="1"?req.session.username:"",
			"avatar":avatar
         })     													
	});	
			
 }else{
	res.render("index",{
	        "login":req.session.login=="1"?true:false,
            "username":req.session.login=="1"?req.session.username:"",
			"avatar":"moren.jpg"
 });
	
	}
}

exports.showRegist=function(req,res,next){
	res.render("regist");
}
exports.doRegist=function(req,res,next){
    var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		//得到表单之后
		var username=fields.username;
		var password=fields.password;
		db.find("user",{"username":username},function(err,result){
			if(err){
				 res.send("-3");
				 return;
			}
			if(result.length!=0)
			{
				res.send("-1");
				return;
			}
			//设置MD5加密
		  password=md5(md5(password)+"lanxiang");
			db.insertOne("user",{
			    "username":username,
				"password":password,
				"avatar":"moren.jpg"
				},function(err,result){
				 if(err){
			   res.send("-3");//服务器错误
			   return;
			  }
			  req.session.login="1";
			  req.session.username=username;
			  res.send("1");//注册成功，写入session
			  
				})
			});
         })
}

exports.showLogin=function(req,res,next){
	res.render("login");
};
exports.doLogin=function(req,res,next){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		//得到表单之后
		var username=fields.username;
		var password=fields.password;
		var jiamihou=md5(md5(password)+"lanxiang");
		db.find("user",{"username":username},function(err,result){
		  console.log(jiamihou);
			if(err){
			   res.send("-3");//服务器错误
			   return;
			}
			if(result.length==0){
				res.send("-1");//没有这个人
				return;
			}
			 if(jiamihou==result[0].password){
				req.session.login="1";
				req.session.username=username;
				res.send("1");//登录成功
				return;
			}else{
				res.send("-2");//密码错误
				return;
			}
		});
 });
};
//设置头像页面，必须保证此时是登录状态
exports.showSetavatar=function(req,res,next){
	//if(req.session.login!="1"){
//		res.send("先登录才能设置头像");
//		return;
//		}
	res.render("setavatar",{
	        "login":true,
            "username":req.session.username||"周2"
 });
	}
	
//设置头像
exports.doSetavatar=function(req,res,next){
	var form=new formidable.IncomingForm();
	form.uploadDir=path.normalize(__dirname+"/../avatar");
	form.parse(req,function(err,fields,files){
		var oldpath=files.touxiang.path;
		var newpath=path.normalize(__dirname+"/../avatar")+"/"+req.session.username+".jpg";
		
		fs.rename(oldpath,newpath,function(err){
			if(err){
			  res.send("失败");
			  return;
			}
			req.session.avatar=req.session.username+".jpg";
			res.redirect("/cut");
			//跳转到切的业务
			//res.redirect("/cut");							
		});
		
	 })
	  
 }
 //显示切图页面
 exports.showCut=function(req,res,next){
	 res.render("cut",{
    	avatar:req.session.avatar
			}
	);
	 }
exports.docut=function(req,res,next){
  //这个页面接收几个get请求参数
  //w、h、x、y
  var filename=req.session.avatar;
  var w=req.query.w;
  var h=req.query.h;
  var x=req.query.x;
  var y=req.query.y;
  
gm("./avatar/"+filename)
     .crop(w,h,x,y)
	 .resize(100,100,"!")
	 .write("./avatar/"+filename,function(err){
	if(err){
    res.send("-1");
	return;
	}
	//更改数据库中当前用户的avatar这个值
	db.updateMany("user",{"username":req.session.username},{$set:{"avatar":req.session.avatar}},function(err,result){
				       res.send("1");
				}
);
	

});
  
}
exports.Post=function(req,res,next){
	//必须保证登录
	if(req.session.login!="1"){
		res.end("这个页面要求登录");
		return;
	}
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		var username=req.session.username;
		//得到表单之后
		var content=fields.content;
			db.insertOne("post",{
			    "username":username,
				"datetime":new Date(),
				"content":content
				},function(err,result){
				 if(err){
			   res.send("-3");//服务器错误
			   return;
			  }
			  res.send("1");
			  
				})
			});
	}
//列出所有说说，有分页功能
exports.getAllshuoshuo=function(req,res,next){
	var page=req.query.page;
	db.find("post",{},{"pageamount":4,"page":page,"sort":{"datetime":-1}},function(err,result){
		res.json(result);	
	});
	
}
exports.getuserinfo=function(req,res,next){
	var username=req.query.username;
	db.find("user",{"username":username},function(err,result){
		var obj={
			"username":result[0].username,
			"avatar":result[0].avatar,
			"_id":result[0]._id
		};
		res.json(obj);
	});
	
}
exports.getshuoshuocount=function(req,res,next){
    db.getAllCount("post",function(count){
		res.send(count.toString());
			});
	}
exports.getusershuoshuo=function(req,res,next){
	var user=req.params["user"];
	 db.find("post",{"username":user},function(err,result1){
	  db.find("user",{"username":user},function(err,result2){
	  res.render("user",{
	  "login":req.session.login=="1"?true:false,
	  "username":req.session.login=="1"?req.session.username:"",
	  "user":user,
	  "cirenshuoshuo":result1,
	  "avatar":result2[0].avatar
		})
	  
	});									  
											  
	});
	
	
}
exports.getAlluser=function(req,res,next){
      db.find("user",{},function(err,result){
	  res.render("userlist",{
	  "login":req.session.login=="1"?true:false,
	  "username":req.session.login=="1"?req.session.username:"",
	  "suoyouchengyuan":result
				 });
		})
	}
exports.showinformation=function(req,res,next){
	res.render("info");
	}
exports.setInformation=function(req,res,next){
	if(req.session.login!="1"){
		res.end("这个页面要求登录");
		return;
	}
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		var username=req.session.username;
		var name=fields.name;
		var email=fields.email;
		var xinbie=fields.xinbie;
	  db.insertOne("xinxi",{
		 "name":name,
		 "email":email,
		 "xinbie":xinbie},function(err,result){
				 if(err){
			   res.send("-3");//服务器错误
			   return;
			  }
			  res.send("1");
			  
				})
							
	 })
    
	}