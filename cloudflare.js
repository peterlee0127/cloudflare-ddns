'use strict';
const getIP = require('external-ip')();
const axios = require('axios');
const config = require('./config.json');
const fs = require('fs');
let nowTimeString = new Date().toISOString();
fs.writeFileSync(nowTimeString,'xxxx','utf8');

let domain = config.domain;
let email = config.email;
let key = config.key;
if(process.env.domain) {
    domain = process.env.domain;
    email = process.env.email;
    key = process.env.key;

}

const api = 'https://api.cloudflare.com/client/v4/';
const headers = {
		'X-Auth-Email':email,
		'X-Auth-Key':key,
		'Content-Type': 'application/json'
	};

function getZoneInfo() {
    let options = {
		url: api+'zones',
		name: domain,
		status:'active',
		headers:headers,
		method: 'get'
	}
	axios(options).then(function (response) {
		let body = response.data;
		let zones = body.result;
		let zone = [];
		for(let i=0;i<zones.length;i++)	 {
			zone.push(zones[i].id);
		}
		getDNSRecord(zone);
    	console.log(zone);
	});
    // request.get(options,function(error,response,body){
	
    // });

}

function getDNSRecord(zones){
    for(let i=0;i<zones.length;i++){
    let zone = zones[i]
    let options = {
		url:api+'zones/'+zone+"/dns_records",
		headers:headers,
		method: 'get'
	}
	axios(options).then(function (response) {
			let body = response.data;
			let json = body.result;
			let ids = [];
			for(let j=0;j<json.length;j++){
				if(json[j].type=='A'){
					ids.push(json[j]);
				}
			}
			 updateRecord(ids);
		});
    // request.get(options,function(error,response,body){

    // });

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
		"name": record.name,
		"type": record.type,
		"content": IP,
		"proxied": true
	}
  	body = JSON.stringify(body);
   	let options = {
		url:api+'zones/'+record.zone_id+"/dns_records/"+record.id,
		data:body,
		headers:headers,
		method: 'put'
	}
	axios(options
	) .then(function (response) {
		let result = response.data.result;
		console.dir({
			'name': result.name,
			'type': result.type,
			'content': result.content,
			'proxied': result.proxied
		});
	});

 });
}
