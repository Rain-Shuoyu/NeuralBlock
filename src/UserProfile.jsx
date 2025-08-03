import React from 'react'

function UserProfile(){
    const admin = {
        name : 'ShuoyuChen',
        age : 18,
        location : 'CHN',
    };

    return (
        <div>
            <h2>Administrator: {admin.name}</h2>
            <p>Age: {admin.age}</p>
            <p> Location: {admin.location}</p>
        </div>
    );
}

export default UserProfile;