const express = require('express');
const cors = require('cors')
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
let cheerio = require('cheerio');
const t = require('typy');

app.use(cors('combined'));
app.use(bodyParser.json({
    limit: '10mb'
}));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(__dirname))


app.get('/',function(req,res){
    res.sendFile('./index.html');
})

app.post('/getdetails', function (req, res) {
    let json = {
        city : req.body.city || 'Chennai',
        category: req.body.category || '',
        id: req.body.id || ''
    } 
    console.log(json);
    let result = [];
    //while(len == 10){
    //console.log(1)
    getDetails(result,json,0,res);
})


async function getDetails(result,json,page,res) {
    try {
        console.log('once', page);
        let catid = '';
        let max = 0;
        let response = await axios.get(`https://t.justdial.com/api/india_api_write/18july2018/searchziva.php?city=${json.city}&area=&lat=&long=&darea_flg=0&case=spcall&stype=category_list&search=${json.category}&national_catid=${json.id}&nextdocid=&attribute_values=&basedon=&sortby=&nearme=0&rnd1=0.60895&rnd2=0.94191&rnd3=0.39962&max=${max}&pg_no=${page}&wap=2&debugmode=1&median_latitude=&median_longitude=&bd_text=&login_mobile=&search_option=0&sort_order=0&pricedesc=0&priceasc=0&checkin=&checkout=&attr_search=&opt=&dummy=0&querySieve=search&querySieve=checkout&querySieve=checkin&adword_pos=%7B%2220%22%3A%22blog-20%22%7D&sieve=%7B%22name%22%3A%22resultModel%22%2C%22selector%22%3A%22result%22%2C%22runInit%22%3Atrue%7D&seopage=&searchReferrer=google-direct%7Cauto&referer=https%3A%2F%2Fwww.google.co.in%2F`);
        if(t(response,'data.main.data.length').safeObject){
            console.log(t(response,'data.main.data.length').safeObject);
            (response.data.main.data).map(function (data) {
                //console.log(data)
                let json = {
                    name: data[1],
                    address: data[3],
                    timing: t(data[11], 'timing').safeObject,
                    number: (data[15].list).map(function (data) {
                        return data.split('_', 1);
                    }),
                    place: data[18],
                    url: data[19],
                }
                result.push(json);
            })
            getDetails(result,json,(page+1),res);
        } else {
            res.send(result)
        }
    } catch (err) {
        console.log(err);
    }
}


process.on('SIGINT', function () {
    console.log('Server closed');
    process.exit(0);
});

app.listen(3000, function (err) {
    if (err)
        console.log(err);
    else
        console.log('App started at ', 3000);
});