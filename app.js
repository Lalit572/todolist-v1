//jshint esversion:6
const express = require("express");
const bodyparser = require("body-parser");
const date = require("./views/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser: true});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended: true}));

app.use(express.static("public"));

const day=date.getDate();
const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name : "Welcome to your to do list."
});

const item2 = new Item({
    name : "Hit a + button to add a new Item."
});

const item3 = new Item({
    name : "Hit <-- this  to add an Item."
});

const initialItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items:[itemSchema]
}); 

const List = mongoose.model("List",listSchema);


//get methods
app.get("/",(req,res)=>{

    
    Item.find({})
   .exec()
   .then((data)=>{
    if(data.length === 0)
    {
        Item.insertMany(initialItems)
        .then(()=>{
            console.log("Inserted");
        })
        .catch((err)=>{                
            console.log(err);
        });
        res.redirect("/");
    }
    else{
        res.render("list",{today:day,addItems:data});
    }
   })
   .catch((e)=>{
    console.log(e);
   });
   
});


app.get("/about",(req,res)=>{
   res.render("about");
});

app.get("/:coustomList",(req,res)=>{
        const coustomList = _.capitalize(req.params.coustomList); 


        List.findOne({name : coustomList})
        .exec()
        .then((findList)=>{
            if(!findList)
            {
                const list = new List({
                    name: coustomList,
                    items: [item1,item2,item3]
                });
        
                list.save();
                res.redirect("/"+coustomList);
            }
            else
            {
                res.render("list",{today:findList.name,addItems:findList.items});
            }
        })
        .catch((e)=>{
            console.log(e);
        });
});

//post methods

app.post("/",(req,res)=>{
    
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const day1=date.getDay()+","; 
       
            const item = new Item({
                name: itemName
            });

            if(listName === day1)
            {
                if(itemName=="")
                {
                    res.redirect("/");
                }
                else
                {
                    item.save();
                    res.redirect("/");
                }
            }
            else{

                List.findOne({name: listName})
                    .exec()
                    .then((foundList)=>{
                        if(item.name === "")
                        {
                            res.redirect("/"+listName);
                        }
                        else{
                            foundList.items.push(item);
                        foundList.save();
                        res.redirect("/"+listName);
                        }
                    })
                    .catch((e)=>{
                        console.log(e);
                    });
                }

        
});

app.post("/delete",(req,res)=>{
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

        if(listName === day)
        {
            Item.deleteOne({_id: checkedItem})
            .then(()=>{
                console.log("Deleted Sucesfully");
                res.redirect("/");
            })
            .catch((e)=>{
                console.log(e);
            })
        }
        else{
            const options = {
                new: true // Return the updated document
              };
            List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItem}}},options)
            .then(()=>{
                res.redirect("/"+listName);
            })
            .catch((e)=>{
                console.log(e);
            });
        }
});

app.listen(3000,()=>{
    console.log("server started at 3000");
});