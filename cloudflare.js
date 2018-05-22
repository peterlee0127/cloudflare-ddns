'use strict';
const getIP = require('external-ip')();
const request = require('request');
const domain = 'xxxxxx.com'
const email = 'xxxxxxx@gmail.com';
const key = 'xxxxxxxxxxxxxx';

const api = 'https://api.cloudflare.com/client/v4/';
const headers = {
		'X-Auth-Email':email,
		'X-Auth-Key':key,
		'Content-Type': 'application/json'
	};

function getZoneInfo() {
    let options = {
	url:api+'zones',
	name:domain,
	status:'active',
 	headers:headers
    }
    request.get(options,function(error,response,body){
	let zones = JSON.parse(body).result;
	let zone = [];
	for(let i=0;i<zones.length;i++)	 {
		zone.push(zones[i].id);
	}
	getDNSRecord(zone);
    	console.log(zone);
    });

}

function getDNSRecord(zones){
    for(let i=0;i<zones.length;i++){
    let zone = zones[i]
    let options = {
	url:api+'zones/'+zone+"/dns_records",
	headers:headers
    }
    request.get(options,function(error,response,body){
	let json = JSON.parse(body).result;
   	let ids = [];
	for(let j=0;j<json.length;j++){
		if(json[j].type=='A'){
			ids.push(json[j]);
		}
	}
    	updateRecord(ids);
    });

  }
}

let IP = '1.1.1.1';
getIP((err, ip) => {
    if (err) {
        // every service in the list has failed
        throw err;
    }
    IP = ip
    console.log(ip);
    getZoneInfo();
});


function updateRecord(records) {
 records.forEach(record => {
   let body = {
	"name":record.name,
	"type":record.type,
	"content":IP
   }
   body = JSON.stringify(body);
   let options = {
	url:api+'zones/'+record.zone_id+"/dns_records/"+record.id,
	body:body,
	headers:headers
    }
   request.put(options,function(error,response,body){

   	console.dir(body,{depth:null});
   });

 });
}
