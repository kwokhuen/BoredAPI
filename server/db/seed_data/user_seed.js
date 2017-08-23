'use strict';

const _ = require('lodash');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');
const {Location} = require('db/models/Location');

const generateUserSeed = function(callback){
    User.find().exec(function(err,users){
        if(users.length>0){
            console.log('users already exist');
            return;
        }
        let user1 = new User({
            "_id": "599ccc508e709da3fcb00bd1",
            "displayName": "JoeLei",
            "firstName": "Joe",
            "lastName": "Lei",
            "age": 37,
            "gender": 1,
            "email": "joelei@gmail.com",
            "username": "joelei",
            "password": "$2a$10$NabnMC30DwTI5Pl3.ipqC.Eq9xdCc93a/lUV4vzmyn4LCvi1zO45S",
            "__v": 4,
            "attended_events": [
                "599cdb6a8e709da3fcb00bdd"
            ],
            "created_events": [
                "599cdb6a8e709da3fcb00bdd"
            ],
            "totalRating": 5,
            "rated_users": [
                "599cd1488e709da3fcb00bd7"
            ],
            "blocked_users": [],
            "friend_requests": [],
            "friends": [
                "599cd1488e709da3fcb00bd7"
            ],
            "tokens": [
                {
                    "access": "auth",
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljY2M1MDhlNzA5ZGEzZmNiMDBiZDEiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ4MTQ1fQ.-C4araCjLVNxR2oGFMlLNAyVOXgEg9hE0m2hjRq0x9o",
                    "_id": "599ccc518e709da3fcb00bd2"
                }
            ]
        });
        let user2 = new User({
            "_id": "599cce8c8e709da3fcb00bd3",
            "displayName": "Raquel",
            "firstName": "Raquel",
            "lastName": "Carion",
            "age": 22,
            "gender": 0,
            "email": "raquelcarion@gmail.com",
            "username": "raquelcarion",
            "password": "$2a$10$J5BqRHRuogU/8MP.jQimdeeDaYikGT/z80vduzf/Bi78XFH.1tJZW",
            "__v": 6,
            "attended_events": [
                "599cdc098e709da3fcb00bde",
                "599cddb2a5816ea5394eb273",
                "599cdb6a8e709da3fcb00bdd",
                "599cfcd2a5816ea5394eb279"
            ],
            "created_events": [
                "599cdc098e709da3fcb00bde",
                "599cddb2a5816ea5394eb273"
            ],
            "totalRating": 0,
            "rated_users": [],
            "blocked_users": [],
            "friend_requests": [
                "599cd1488e709da3fcb00bd7"
            ],
            "friends": [],
            "tokens": [
                {
                    "access": "auth",
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljY2U4YzhlNzA5ZGEzZmNiMDBiZDMiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ4NzE3fQ.1BxYxyPzcwvP2Xvhy_bBsCkcicV2sJhDOprN7ShCxvo",
                    "_id": "599cce8d8e709da3fcb00bd4"
                }
            ]
        });
        let user3 = new User({
            "_id": "599cceeb8e709da3fcb00bd5",
            "displayName": "Jaemin",
            "firstName": "Jaemin",
            "lastName": "Yoon",
            "age": 20,
            "gender": 1,
            "email": "jaemin@gmail.com",
            "username": "jaeminyoon",
            "password": "$2a$10$g0.HEFi6xPGXVmx5Fe8noO/EeSd74H4MozziDC24EfKSfbTtSN9wu",
            "__v": 3,
            "attended_events": [
                "599cdc098e709da3fcb00bde",
                "599cddb2a5816ea5394eb273"
            ],
            "created_events": [],
            "totalRating": 0,
            "rated_users": [],
            "blocked_users": [],
            "friend_requests": [],
            "friends": [],
            "tokens": [
                {
                    "access": "auth",
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljY2VlYjhlNzA5ZGEzZmNiMDBiZDUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ4ODExfQ.deS-dqhWeieSrCVmIyIv5Ig6yH5jajG_qBEzHldrjYw",
                    "_id": "599cceeb8e709da3fcb00bd6"
                }
            ]
        });
        let user4 = new User({
            "_id": "599cd1488e709da3fcb00bd7",
            "displayName": "Carrey Yip",
            "firstName": "Carrey",
            "lastName": "Yip",
            "age": 22,
            "gender": 0,
            "email": "carrey201@gmail.com",
            "username": "carreyyip",
            "password": "$2a$10$BSY/Cep8wQNemxHGI95HR.utUxaaFiR0N/x7UH6okh0ZraqyFDq3G",
            "__v": 5,
            "attended_events": [
                "599cfcd2a5816ea5394eb279",
                "599cdb6a8e709da3fcb00bdd"
            ],
            "created_events": [
                "599cfcd2a5816ea5394eb279"
            ],
            "totalRating": 0,
            "rated_users": [],
            "blocked_users": [],
            "friend_requests": [],
            "friends": [
                "599ccc508e709da3fcb00bd1"
            ],
            "tokens": [
                {
                    "access": "auth",
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljZDE0ODhlNzA5ZGEzZmNiMDBiZDciLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ5NDE2fQ.KnmGgzm2o_Kn_mxotyQ0rx-YbNVkQoKPl3EcbevElG8",
                    "_id": "599cd1488e709da3fcb00bd8"
                }
            ]
        });

            console.log('hello');

        let seedUsers = [user1, user2, user3, user4];
        User.insertMany(seedUsers).then(()=>{
           callback();
        }).catch(err=>{console.error(err);});
    });
};

module.exports = generateUserSeed;
