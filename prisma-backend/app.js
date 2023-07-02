var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fs = require("fs");
var cors = require("cors");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { Sequelize, INTEGER } = require("sequelize");
const { PrismaClient } = require('@prisma/client')
const { getPrismaClient } = require('@prisma/client/runtime')
var bodyParser = require('body-parser')
const saltRounds = 10;
const prisma = new PrismaClient()
var mysql = require("mysql");
const { exception } = require("console");
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'carteasyfyp@gmail.com',
    pass: 'Khan@130'
  }
});


var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  password: 'password',
  user: "root",
  database: "testitem",
});

// const con = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'data.sqlite'
// });

con.connect(function (err) {
  if (err) throw err;
  console.log(" sql db Connected!");
});
var app = express();
var multer = require('multer');
const { parse } = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('here')
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

var upload = multer({ storage: storage, limits: { fileSize: 1000 * 1000 } })
// var upload = multer({ dest: 'uploads/' })
app.use(express.static(__dirname + '/uploads'));
app.use(cors());
// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  if (req.query.id === undefined) {
    res.send("null");
    return;
  }
  sql = `select i.id,i.name,i.price,i.description,i.imgurl,i.seller,i.category,i.selleremail,s.address,s.rating,s.ratingcount from item i join seller s on i.selleremail=s.email WHERE i.id=${req.query.id}`;
  con.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.statusCode = 200
      res.send(result);
    }
  });
});

app.get("/items", (req, res) => {
  if (req.query.search === "" || req.query.search == undefined) {
    con.query("select * from item", (err, result) => {
      if (err) throw err;
      else {
        authtoken = req.headers.authtoken;
        console.log(authtoken);
        jwt.verify(authtoken, "secret", function (err, decoded) {
          //console.log(decoded.data) // bar
        });
        res.send(result);
      }
    });
  }
  else {
    con.query("select * from item where name LIKE ? OR category LIKE ?", ['%' + req.query.search + '%', '%' + req.query.search + '%'], (err, result) => {
      if (err) {
        console.log(err)
      }
      else {
        authtoken = req.headers.authtoken;
        console.log(authtoken);
        jwt.verify(authtoken, "secret", function (err, decoded) {
          //console.log(decoded.data) // bar
        });
        res.send(result);
      }
    });
  }
});

app.post('/items', upload.single('productimg'), async (req, res, next) => {
  console.log(req)
  var name = req.body.name
  var price = req.body.price
  var description = req.body.description
  var imgurl = "req.file.filename"
  console.log(req.headers.authtoken)
  let id = ""
  jwt.verify(req.headers.authtoken, "secret", (err, decoded) => {
    if (err) console.log(err)
    console.log(decoded.data)
    id = decoded.data

  })
  let seller = await prisma.seller.findFirst({
    where: { id: parseInt(id) }
  })
  console.log(seller)
  req.body.seller = seller.store_name
  req.body.selleremail = seller.email
  // console.log(req.file.filename)
  // SQL = "INSERT INTO `item`(`id`, `name`, `price`, `description`, `imgurl`, `seller`) VALUES (?,?,?,?,?,?)"
  // con.query(SQL,[Date.now , name , price , description,imgurl , seller], (err ,restlt)=>{
  //   if (err) { console.log(err)}
  //   else{console.log('sql done') }
  // })
  // res.send('done')
  req.body.imgurl = req.file.filename
  var obj = await prisma.item.create({
    data: req.body
  })
  res.send(obj)


})


app.get("/register", (req, res) => {
  username = req.query.username;
  password = req.query.password;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    if (err) console.log(err);
    password = hash;
    sql =
      "INSERT INTO `users` (`id`, `name`, `password`) VALUES ('" +
      Math.random() * 10000 +
      "'" +
      "," +
      "'" +
      username +
      "'" +
      "," +
      "'" +
      password +
      "'" +
      ")";
    console.log(sql);
    try {
      con.query(sql, (err, result) => {
        if (err) {
          res.send(JSON.stringify({ status: "404", msg: "error" }));
          throw err;
        } else {
          res.send(JSON.stringify({ status: "200", msg: "done " }));
        }
      });
    } finally {
      console.log("done");
    }
  });
});
app.get("/login", (req, res) => {
  username = req.query.username;
  password = req.query.password;

  sql = "SELECT * FROM `users` WHERE name=" + "'" + username + "'";

  try {
    con.query(sql, (err, result) => {
      if (err) throw err;
      else {
        if (result.length == 0) {
          res.statusCode = 400
          res.send(JSON.stringify({ status: "404", msg: "user not valid" }));
          return;
        }
        bcrypt.compare(password, result[0].password, function (err, docs) {
          if (docs == false) {
            res.statusCode = 400
            res.send(JSON.stringify({ status: "404", msg: "wrong password" }));
            return;
          }
          data = jwt.sign(
            {
              data: result[0].id,
            },
            "secret",
            { expiresIn: "10h" }
          );
          res.statusCode = 200
          res.send(JSON.stringify({ status: "ok", token: data }));
        });
      }
    });
    // console.log(results ,metadata)
  } finally {
    console.log("done");
  }
});
app.get("/addcart", async (req, res) => {
  item = req.query.id;
  var url = req.query.url;
  var number = req.query.number;
  token = req.headers.authtoken;
  var sellerName = req.query.seller
  var selleremail = req.query.selleremail
  var name = req.query.name
  var price = req.query.price

  let user = null;
  console.log('got url for query', url)
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
    }
    if (decoded.data == undefined) {
      res.send(JSON.stringify({ error: "no auth token" }));
    }
    user = decoded.data;
  });
  done = 0;
  sql =
    "INSERT INTO `cart` (`item`, `number`, `user`, `done` , `url` , `name` , `price`, `seller` , `selleremail`) VALUES (? , ? , ? ,? ,? , ? , ? , ? , ?)"


  try {
    for(let i =0 ; i < number ; i++ ){
    con.query(sql, [item, 1, user, 0, url, name, price, sellerName, selleremail], (err, result) => {
      if (err) {
        console.log(err)
        sql2 = "UPDATE `cart` SET number=number+1 WHERE user=? AND item=?"
        con.query(sql2, [user, item], (err, result) => {
          if (err) {
            console.log(err)
          }
          else {
            console.log('inserted data', result)
          }
        })
      };

      console.log(result);
    });
  }
  res.send(JSON.stringify({"status ":"ok"}));


  } catch(e) {


    console.log("error",e);
  }
});
app.delete('/cart/:id', async (req, res) => {
  let token = req.headers.authtoken;
  let id = req.params.id
  user = null
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
    }
    if (decoded.data == undefined) {
      res.send(JSON.stringify({ error: "no auth token" }));
    }
    user = decoded.data;
  });
  const cart = await prisma.cart.deleteMany({
    where: {
      id: parseInt(id)
    }
  })
  res.send(cart)
})
app.get("/cart", async (req, res) => {
  token = req.headers.authtoken;
  let user = null;
  //console.log(token)
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
      res.statusCode = 400
      res.send(JSON.stringify({ "err": "user invalid" }))
      return;
    }
    user = decoded.data;
  });
  if (user == null) {
    return;
  }
  else {
    var cart = await prisma.cart.findMany({
      where: {
        user: user,
        orderNo: 0
      }
    })
    res.send(cart)
  }

});
app.post("/buy", async (req, res) => {
  token = req.headers.authtoken;
  let user = null;
  let time = new Date().valueOf().toString()
  //console.log(token)
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
    }
    user = decoded.data;
  });
  // sql = `INSERT INTO userinfo  (name, phone, email ,address , id , uni) VALUES  (?, ?, ? ,?, ?,?) ON DUPLICATE KEY UPDATE  name = ?,  phone = ?,  email = ?,  address = ? , uni =?`;
  // con.query(
  //   sql,
  //   [
  //     req.body.name,
  //     req.body.phone,
  //     req.body.email,
  //     req.body.address,
  //     user,
  //     time,
  //     req.body.name,
  //     req.body.phone,
  //     req.body.email,
  //     req.body.address,
  //     time,


  //   ],
  //   (err, result) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log('user info table ',result);
  //     }
  //   }
  // );



  var obj = await prisma.orderinfo.create({
    data: {
      userid: user,
      addressid: time
    }
  })
  console.log('obj is ', obj)
  var userinfo = await prisma.userinfo.create({
    data: {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email,
      orderid: obj.orderid.toString()
    }
  })
  var boys = await prisma.deliveryboy.findMany({
    where: {
      taskid: -1
    }
  })
  if (boys.length != 0) {


    rand = Math.floor(Math.random() * boys.length)
    // console.log(boys)
    selectid = boys[rand].id
    var boyupdateobj = await prisma.deliveryboy.updateMany({
      where: {
        id: selectid
      },
      data: {
        taskid: obj.orderid
      }
    })
    // console.log("chosen boy is  ", boys[rand].email)



    var cart = await prisma.cart.updateMany({
      where: {
        user: user,
        orderNo: 0
      },
      data: {
        orderNo: obj.orderid,

      },
    })
    var cart2 = await prisma.cart.findMany({
      where: {
        user: user,
        orderNo: obj.orderid,
      }
    })
    var mailOptions = {
      from: 'carteasyfyp@gmail.com',
      to: req.body.email,
      subject: 'Thank you for ordering',
      html: `Your order is under process and will be delivered shortly. Click on the link for order details<a href="http://localhost:3000/orderdetails?id=` + obj.orderid + `">Link</a><br/> Thank for visiting us. Have a good day 😊`
    };

    var mailOptions2 = {
      from: 'carteasyfyp@gmail.com',
      to: boys[rand].email,
      subject: 'New Task',
      html: `We have an order for you. Check the details in the link <a href="http://localhost:3000/deliverydetails?id=` + obj.orderid + `">Link</a>`
    };

    cart2.forEach(e => {
      var mailOptionstemp = {
        from: 'carteasyfyp@gmail.com',
        to: e.selleremail,
        subject: 'Order for your store',
        html: `You have received an order , the product url is <a href="http://localhost:3000/product/` + e.item + `">Link</a><br/>The delivery person will reach you shortly.`
      };
      transporter.sendMail(mailOptionstemp, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent to user : ', info);
        }
      });

    });


    // console.log('hi')
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent to user : ', info);
      }
    });
    transporter.sendMail(mailOptions2, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent to delivery boy : ', info);

      }
    });
    console.log("item2", cart2)
    res.send(JSON.stringify({ items: cart2, info: obj }))








  }
  else {
    res.status = 500
    res.send(JSON.stringify({ err: "something went wrong" }))
  }
  // sql = 'SELECT * FROM `cart` WHERE user=?'
  // con.query(sql ,[ user] , (err , result )=> {
  //   if(err) console.log(er)
  //   else{
  //     let array = []
  //     result.forEach(element => {
  //       array.push(element.item)

  //     });
  //     // array = new Set(array)

  //     sql2 = "INSERT INTO `orderinfo`(`userid`, `itemid`, `addressid`, `orderid`, `completed`) VALUES "
  //     var temp =""
  //     for(var i = 0 ; i< array.length; i++)
  //       temp +=  '('+ user + ','+  array[i]+ ','+ 1 + ','+ 1+ ','+ 0 +')' + ','


  //     sql2= (sql2 + temp)
  //     sql2 = sql2.slice(0 , sql2.length -1)
  //     // console.log(sql2)

  //     con.query(sql2 , (err, result=>{
  //       if(err){
  //         console.log(err);
  //       }
  //       else{
  //         console.log(result)
  //       }
  //     }))


  //   }
  // })
  // res.send(JSON.stringify({ data: req.body }));
});
app.get('/order', async (req, res) => {
  token = req.headers.authtoken;
  let user = null;
  //console.log(token)
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
    }
    user = decoded.data;
  });
  var order = await prisma.cart.findMany({
    where: {
      user: user,
      NOT: {
        orderNo: 0
      }
    }
  })
  res.send(order)
})
app.get('/order/:id', async (req, res) => {
  // token = req.headers.authtoken;
  // let user = null;
  // console.log(req.params.id)
  // await jwt.verify(token, "secret", (err, decoded) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   user = decoded.data;
  // });
  var cart = await prisma.cart.findMany({
    where: {
      orderNo: parseInt(req.params.id),
    }
  })
  var address = await prisma.userinfo.findFirst({
    where: {
      orderid: req.params.id
    }
  })
  var orderinfo = await prisma.orderinfo.findFirst({
    where: {
      orderid: parseInt(req.params.id)
    }
  })

  res.send(JSON.stringify({ cart: cart, address: address, completed: orderinfo.completed }))
})
app.get('/doneorder', async (req, res) => {
  token = req.headers.authtoken;
  let id = req.query.id
  let user = null;
  console.log(parseInt(id))
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
      res.statusCode = 400
      res.send("err")
    }
    user = decoded.data;
  });

  let order = await prisma.orderinfo.updateMany({
    where: {
      userid: user,
      orderid: parseInt(id)
    },
    data: {
      completed: 1
    }
  })
  let boy = await prisma.deliveryboy.updateMany({
    where: {
      taskid: parseInt(id)
    },
    data: {
      taskid: -1
    }
  })
  console.log(boy)
  res.send(order)
})
app.post('/createdeliveryboy', async (req, res) => {
  console.log(req.body)
  let boy = await prisma.deliveryboy.create({
    data: req.body
  })
  res.send(boy)
})
app.get('/deliveryboy', async (req, res) => {
  let id = req.query.id
  let boy = await prisma.deliveryboy.findFirst({
    where: {
      id: parseInt(id)
    }
  })
  res.send(boy)

})

app.post('/sellerlogin', async (req, res) => {
  let seller = await prisma.seller.findFirst({
    where: req.body
  })
  data = jwt.sign(
    {
      data: seller.id,
    },
    "secret",
    { expiresIn: "10h" }
  );
  console.log(data)
  res.send(JSON.stringify({ status: "OK", token: data, role: "seller" }))
})
app.post('/sellerregister', async (req, res) => {
  console.log(req.body)
  console.log(req.body)
  let seller = await prisma.seller.create({
    data: req.body
  })
  res.send(req.body)
})

// app.get('/donedelivery', async(req,res)=>{
//   token = req.headers.authtoken;
//   let user = null;
//   //console.log(token)
//   await jwt.verify(token, "secret", (err, decoded) => {
//     if (err) {
//       console.log(err);
//     }
//     user = decoded.data;
//   });
//   var orderid =  parseInt( req.query.id)
//   var order = await prisma.cart.findMany({
//     where:{
//       orderNo: orderid,
//       user:user
//     }

//   })
//   res.send(order)

// })
app.get('/sellerproducts' , async (req,res)=>{
  token = req.headers.authtoken;
  let sellerid = null;
  // console.log(parseInt(id))
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
      res.statusCode = 400
      res.send("err")
    }
    sellerid = decoded.data;
  });
  console.log("seller id" , sellerid)
  let sellername = await prisma.seller.findMany({
    where:{
      id:sellerid
    }
  })
console.log("seller name " , sellername)

  let item = await prisma.item.findMany({
    where:{
      seller:sellername[0].store_name,
    }
  })
  console.log(item)
  res.send(item)

})
app.delete('/sellerproducts', async(req ,res)=>{

  token = req.headers.authtoken;
  let sellerid = null;
  // console.log(parseInt(id))
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
      res.statusCode = 400
      res.send("err")
    }
    sellerid = decoded.data;
  });
  let seller = await prisma.seller.findMany({
    where:{
      id:sellerid
    }
  })
  console.log(seller)
  console.log("id is", req.query.id)
  // return
  
  let item = await prisma.item.deleteMany({
    where:{
      id: parseInt( req.query.id),
      seller:seller[0].store_name
    }
  })
  console.log(item)
  res.send(item)
})

app.post('/ratesellerbydeliveryboy', async (req,res)=>{
  let seller=await prisma.seller.updateMany({
    where:{
      store_name:req.body.seller
    },
    data:{
      rating:{
        increment:parseInt(req.body.rating)
      },
      ratingcount:
      {
        increment:1
      }
    }
  });

  let cart=await prisma.cart.updateMany({
    where:{
      seller:req.body.seller,
      orderNo: parseInt(req.body.orderNo)
    },
    data:{
      isratedbydeliveryboy:1
    }
  })
  res.send(JSON.stringify(
    {
      status:"OK"
    }
  ));
})

app.post('/ratesellerbyuser', async (req,res)=>{
  let seller=await prisma.seller.updateMany({
    where:{
      store_name:req.body.seller
    },
    data:{
      rating:{
        increment:parseInt(req.body.rating)
      },
      ratingcount:
      {
        increment:1
      }
    }
  });

  let cart=await prisma.cart.updateMany({
    where:{
      seller:req.body.seller,
      orderNo: parseInt(req.body.orderNo)
    },
    data:{
      isratedbyuser:1
    }
  })
  res.send(JSON.stringify(
    {
      status:"OK"
    }
  ));
})

app.get('/getsellerinfo', async (req,res)=>{

  token = req.headers.authtoken;
  let sellerid = null;
  // console.log(parseInt(id))
  await jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      console.log(err);
      res.statusCode = 400
      res.send("err")
    }
    sellerid = decoded.data;
  });
  let seller = await prisma.seller.findMany({
    where:{
      id:sellerid
    }
  })
  console.log(seller)
  res.send(seller[0])
})
app.get('/prisma', async (req, res) => {
  var user = await prisma.seller.findMany()
  res.send(JSON.stringify(user))
})
app.post('/prisma', async (req, res) => {
  try {
    var user = await prisma.con.create({
      data: req.body
    })
  }
  catch (err) {
    console.log("there is an error " + err)
    res.statusCode = 400
    res.send('error')
  }


  res.send(JSON.stringify(user))
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(4000, () => { console.log('server is running on 4000 ') })