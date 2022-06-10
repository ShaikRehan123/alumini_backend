const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const PORT = process.env.PORT || 8080;
const moment = require("moment");
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_hor",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err);
    return;
  }
  console.log(`Connected with threadID ${connection.threadId}`);
});

app.get("/", (req, res) => {
  res.send({
    status: 200,
    message: "Hello Noob",
  });
});

app.get("/rooms", (req, res) => {
  connection.query(
    "SELECT * FROM `room` ORDER BY `price` ASC",
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });

      res.send({
        status: 200,
        message: "Found Rooms Successfully",
        data: result,
      });

      console.log(result);
    }
  );
});

app.post("/user_login", (req, res) => {
  const { email, password } = req.body;
  connection.query(
    "SELECT * FROM `users` WHERE `u_email_id` = ? AND `u_password` = ?",
    [email, password],
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      else if (result.length > 0) {
        res.send({
          status: 200,
          message: "Successfully Logged In",
          data: JSON.stringify(result),
        });
      } else {
        res.send({
          status: 404,
          message: "Invalid Credentials",
        });
      }

      console.log(result);
    }
  );
  // console.log(email, password);
  // res.send({
  //   status: 200,
  //   message: "test",
  //   data: "test",
  // });
});

app.post("/admin_login", (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);
  connection.query(
    "SELECT * FROM `admin` WHERE `username` = ? AND `password` = ?",
    [email, password],
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      else if (result.length > 0) {
        res.send({
          status: 200,
          message: "Successfully Logged In",
          data: JSON.stringify(result),
        });
      } else {
        res.send({
          status: 404,
          message: "Invalid Credentials",
        });
      }

      console.log(result);
    }
  );
  // res.send({
  //   status: 200,
  //   message: "test",
  //   data: "test",
  // });
});

app.post("/update_user", (req, res) => {
  const { name, username, mobile_no, email, password } = req.body;
  // console.log(name, username, mobile_no, email, password);
  connection.query(
    "UPDATE `users` SET `u_name` = ?, `u_username` = ?, `u_mobileno` = ?, `u_email_id` = ?, `u_password` = ? WHERE `u_email_id` = ?",
    [name, username, mobile_no, email, password, email],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        // get the updated user
        connection.query(
          "SELECT * FROM `users` WHERE `u_email_id` = ?",
          [email],
          function (err, result1) {
            if (err)
              res.send({
                status: 500,
                message: "Something is wrong on our side",
                error: err,
              });
            else {
              res.send({
                status: 200,
                message: "Successfully Updated",
                data: JSON.stringify(result1),
              });
              console.log(result1);
            }
          }
        );
      }
    }
  );
});

app.get("/room_details/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM `room` WHERE `room_id` = ?",
    [id],
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
        console.log(result);
      }
    }
  );
});

app.post("/add_guest", (req, res) => {
  const {
    name,
    email,
    mobile,
    userid,
    booking_date,
    arrival_from,
    purpose_of_the_visit,
    room_id,
  } = req.body;
  console.log(
    name,
    email,
    userid,
    booking_date,
    arrival_from,
    purpose_of_the_visit
  );

  // Check if already booked on the same date and same room_id
  connection.query(
    "select * from `transaction` where `checkin` = ? && `room_id` = ?",
    [booking_date, room_id],
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      else if (result.length > 0) {
        res.send({
          status: 404,
          message: "Already Booked on this date",
        });
      } else {
        connection.query(
          "INSERT INTO `guest` (name,r_date,mobile,mail_id,createdDate,id_u) VALUES (?,?,?,?,?,?)",
          [
            name,
            booking_date,
            mobile,
            email,
            new Date().toISOString().slice(0, 19).replace("T", " "),
            userid,
          ],
          function (err, result1) {
            if (err) {
              res.send({
                status: 500,
                message: "Something is wrong on our side",
                error: err,
              });
            } else {
              console.log(result1);
              // Get the guest details
              connection.query(
                "SELECT * FROM `guest` WHERE `mail_id` = ?",
                [email],
                function (err, result2) {
                  if (err)
                    res.send({
                      status: 500,
                      message: "Something is wrong on our side",
                      error: err,
                    });
                  else {
                    // Insert into transaction table
                    connection.query(
                      "INSERT INTO `transaction`(guest_id, room_id, status, checkin,id_id,a_from,a_visit) VALUES (?,?,?,?,?,?,?)",
                      [
                        result2[0].guest_id,
                        room_id,
                        "Pending",
                        booking_date,
                        userid,
                        arrival_from,
                        purpose_of_the_visit,
                      ],
                      function (err, result2) {
                        if (err) {
                          res.send({
                            status: 500,
                            message: "Something is wrong on our side",
                            error: err,
                          });
                        } else {
                          res.send({
                            status: 200,
                            message: "Successfully Booked",
                            data: result2,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );

  // res.send({
  //   status: 200,
  //   message: "test",
  //   data: "test",
  // });
});

app.get("/user_bookings/:user_id", (req, res) => {
  const { user_id } = req.params;
  connection.query(
    "SELECT * FROM `transaction` NATURAL JOIN `guest` NATURAL JOIN `room` WHERE  id_id = ?",
    [user_id],
    function (err, result) {
      if (err)
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
        console.log(result);
      }
    }
  );
});

app.get("/get_all_admins", (req, res) => {
  connection.query("SELECT * FROM ADMIN", function (err, result) {
    if (err) {
      res.send({
        status: 500,
        message: "Something is wrong on our side",
        error: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Successfully Fetched",
        data: result,
      });
      console.log(result);
    }
  });
});

// Get adming by id
app.get("/get_admin_by_id/", (req, res) => {
  const { admin_id } = req.query;
  console.log(admin_id);
  connection.query(
    "SELECT * FROM ADMIN WHERE admin_id = ?",
    [admin_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
        console.log(result);
      }
    }
  );
});

app.put("/update_admin", (req, res) => {
  const { admin_id, name, username, password } = req.body;
  console.log(admin_id, name, username, password);
  connection.query(
    "UPDATE ADMIN SET name = ?, username = ?, password = ? WHERE admin_id = ?",
    [name, username, password, admin_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Updated",
          data: result,
        });
      }
    }
  );
});

app.get("/pending_reservations", (req, res) => {
  connection.query(
    "SELECT * FROM `transaction` NATURAL JOIN `guest` NATURAL JOIN `room` WHERE `status` = 'Pending'",
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        // Get Number of pending reservations
        connection.query(
          "SELECT COUNT(*) AS count FROM `transaction` WHERE `status` = 'Pending'",
          function (err, result1) {
            if (err) {
              res.send({
                status: 500,
                message: "Something is wrong on our side",
                error: err,
              });
            } else {
              res.send({
                status: 200,
                message: "Successfully Fetched",
                data: result,
                count: result1[0].count,
              });
            }
          }
        );
      }
    }
  );
});

app.delete("/delete_reservation", (req, res) => {
  const { transaction_id } = req.query;
  connection.query(
    "DELETE FROM `transaction` WHERE `transaction_id` = ?",
    [transaction_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Deleted",
          data: result,
        });
      }
    }
  );
});

app.get("/get_transaction_by_id", (req, res) => {
  const { transaction_id } = req.query;
  console.log(transaction_id);
  connection.query(
    "SELECT * FROM `transaction` NATURAL JOIN `guest` NATURAL JOIN `room` WHERE `transaction_id` = ?",
    [transaction_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
        console.log(result);
      }
    }
  );
});

app.post("/confirm_checkin", (req, res) => {
  const [room_no, no_of_days, extra_bed, transaction_id] = [
    req.body.room_no,
    req.body.no_of_days,
    req.body.extra_bed,
    req.body.transaction_id,
  ];
  console.log(room_no, no_of_days, extra_bed, transaction_id);
  connection.query(
    "SELECT * FROM `transaction` WHERE `room_no` = ? && `status` = 'Check In'",
    [room_no],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        if (result.length > 0) {
          res.send({
            status: 500,
            message: "Room is already occupied",
            data: result,
          });
        } else {
          connection.query(
            "SELECT * FROM `transaction` NATURAL JOIN `guest` NATURAL JOIN `room` WHERE `transaction_id` = ?",
            [transaction_id],
            function (err, result1) {
              if (err) {
                res.send({
                  status: 500,
                  message: "Something is wrong on our side",
                  error: err,
                });
              }
              console.log(result1);
              let total = result1[0].price * no_of_days;
              let total2 = 800 * extra_bed;
              const total_amount = total + total2;
              // checkout date is the date of check in + no of days and format it ad y-m-d
              // console.log(result1[0].check_in);
              const checkout_date = moment(result1[0].checkin).add(
                no_of_days,
                "days"
              );
              const checkout_date_format =
                moment(checkout_date).format("YYYY-MM-DD");
              connection.query(
                "UPDATE `transaction` SET `room_no` = ?, `days` = ?, `extra_bed` = ?, `status` = 'Check In', `checkin_time` = ?, `checkout` = ?, `bill` = ? WHERE `transaction_id` = ?",
                [
                  room_no,
                  no_of_days,
                  extra_bed,
                  // it should be the current time like hours:minutes:seconds
                  moment().format("HH:mm:ss"),
                  checkout_date_format,
                  total_amount,
                  transaction_id,
                ],
                function (err, result2) {
                  if (err) {
                    res.send({
                      status: 500,
                      message: "Something is wrong on our side",
                      error: err,
                    });
                  } else {
                    res.send({
                      status: 200,
                      message: "Successfully Checked In",
                      data: result2,
                    });
                  }
                }
              );
            }
          );
        }
      }
    }
  );
});

// get count of all three types of rooms
app.get("/get_room_count", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS count FROM `transaction` WHERE `status` = 'Check In'",
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        connection.query(
          "SELECT COUNT(*) AS count FROM `transaction` WHERE `status` = 'Check Out'",
          function (err, result1) {
            if (err) {
              res.send({
                status: 500,
                message: "Something is wrong on our side",
                error: err,
              });
            } else {
              connection.query(
                "SELECT COUNT(*) AS count FROM `transaction` WHERE `status` = 'Pending'",
                function (err, result2) {
                  if (err) {
                    res.send({
                      status: 500,
                      message: "Something is wrong on our side",
                      error: err,
                    });
                  } else {
                    res.send({
                      status: 200,
                      message: "Successfully Fetched",
                      check_in: result[0].count,
                      check_out: result1[0].count,
                      pending: result2[0].count,
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.get("/checkin_reservation", (req, res) => {
  connection.query(
    "SELECT * FROM `transaction` NATURAL JOIN `guest` NATURAL JOIN `room` WHERE `status` = 'Check In'",
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
      }
    }
  );
});

app.put("/confirm_checkout", (req, res) => {
  const { transaction_id } = req.body;
  console.log(transaction_id);
  connection.query(
    "UPDATE `transaction` SET `checkout_time` = ?, `status` = 'Check Out' WHERE `transaction_id` = ?",
    [moment().format("HH:mm:ss"), transaction_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      }
      res.send({
        status: 200,
        message: "Successfully Checked Out",
        data: result,
      });
    }
  );
});

app.get("/checkout_reservation", (req, res) => {
  connection.query(
    "SELECT * FROM `transaction` NATURAL JOIN `guest` NATURAL JOIN `room` WHERE `status` = 'Check Out'",
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
      }
    }
  );
});

app.get("/get_all_rooms", (req, res) => {
  connection.query("SELECT * FROM `room`", function (err, result) {
    if (err) {
      res.send({
        status: 500,
        message: "Something is wrong on our side",
        error: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Successfully Fetched",
        data: result,
      });
    }
  });
});

app.get("/get_room_by_id", (req, res) => {
  const { room_id } = req.query;
  connection.query(
    "SELECT * FROM `room` WHERE `room_id` = ?",
    [room_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Fetched",
          data: result,
        });
      }
    }
  );
});

app.put("/update_room", (req, res) => {
  // const { room_id } = req.query;
  console.log(req.query);
  console.log(req.body);
  // access form data
  // console.log(req.body, room_id);
  // Update room_type and room_price only
  let { room_type, price } = req.body;
  let { room_id } = req.query;
  // convert room_type snake case to title case
  room_type = room_type.charAt(0).toUpperCase() + room_type.slice(1);
  room_type = room_type.replace(/_/g, " ");
  console.log(room_type);
  connection.query(
    "UPDATE `room` SET `room_type` = ?, `price` = ? WHERE `room_id` = ?",
    [room_type, req.body.price, req.query.room_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Updated",
          data: result,
        });
      }
    }
  );
  // res.send({
  //   status: 200,
  //   message: "Test",
  //   data: req.body,
  // });
});

app.delete("/delete_room", (req, res) => {
  const { room_id } = req.query;
  connection.query(
    "DELETE FROM `room` WHERE `room_id` = ?",
    [room_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Deleted",
          data: result,
        });
      }
    }
  );
});

app.post("/add_room", (req, res) => {
  let { room_type, price } = req.body;
  // convert room_type snake case to title case
  room_type = room_type.charAt(0).toUpperCase() + room_type.slice(1);
  room_type = room_type.replace(/_/g, " ");
  console.log(room_type);
  // random number between 1 and 6
  let image_number = Math.floor(Math.random() * 6) + 1;
  connection.query(
    "INSERT INTO `room` (`room_type`, `price` , `photo`) VALUES (?, ?, ?)",
    [room_type, req.body.price, `${image_number}.jpg`],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Added",
          data: result,
        });
      }
    }
  );
});

app.get("/get_all_users", (req, res) => {
  connection.query("SELECT * FROM `users`", function (err, result) {
    if (err) {
      res.send({
        status: 500,
        message: "Something is wrong on our side",
        error: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Successfully Fetched",
        data: result,
      });
    }
  });
});

app.delete("/delete_user", (req, res) => {
  const { user_id } = req.query;
  connection.query(
    "DELETE FROM `users` WHERE `u_id` = ?",
    [user_id],
    function (err, result) {
      if (err) {
        res.send({
          status: 500,
          message: "Something is wrong on our side",
          error: err,
        });
      } else {
        res.send({
          status: 200,
          message: "Successfully Deleted",
          data: result,
        });
      }
    }
  );
});

app.listen(PORT, function (err) {
  if (err) {
    console.error("error connecting: " + err);
    return;
  }
  console.log(`Listening on PORT ${PORT} `);
});
