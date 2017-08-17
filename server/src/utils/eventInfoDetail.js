'use strict';

const _ = require('lodash');

const eventInfoDetail = function(self_user, that_event, location, permission){
    let result = that_event.toJSON();

    //location info
    if(location){
        result.location_name = location.name;
        result.address = location.address;
        result.city = location.city;
        result.zipcode = location.zipcode;
        result.state = location.state;
    }

    result = _.pick(result,permission);

    //relationship to event
    result.hasRated = that_event.wasRatedBy(self_user);
    result.isAdmin = that_event.isAdmin(self_user);
    result.isAttendee = that_event.isAttendee(self_user);

    return result;
}

module.exports = {eventInfoDetail};