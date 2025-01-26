const db = require("../Route/connection");

function formatDateTimeForMySQL(dateTime) {
    dateTime.setHours(dateTime.getHours() + 5);
    dateTime.setMinutes(dateTime.getMinutes() + 30);

    return dateTime.toISOString().slice(0, 19).replace('T', ' ');
}

function updateExpireStatus() {
    const currentDate = new Date();
    const currentDateStr = formatDateTimeForMySQL(currentDate);

    const sql = `UPDATE product SET expire_sts = 1 WHERE expire_date <= '${currentDateStr}'`;

    db.query(sql, (error, result) => {
        if (error) {
            console.error("Database query error:", error);
        } else {
            console.log("Updated successfully");
        }
    });
}

module.exports={
     formatDateTimeForMySQL,
     updateExpireStatus
}