var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "tristan9014219",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query('select * from products', function (err, result, fields) {
        if (err) throw err;
        console.log('\n');
        for (var i = 0; i < result.length; i++) {
            console.log(result[i].item_id + '   ' + result[i].product_name + '.............$' + result[i].price);
        };            
        console.log("\n---------------------------------------------------\n")

        inquirer
            .prompt([
                {
                    name: "whatToBuy",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < result.length; i++) {
                            choiceArray.push(result[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "What would you like to buy?"
                },
                {
                    name: "howMuch",
                    type: "input",
                    message: "How many items would you like to buy?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].product_name === answer.whatToBuy) {
                        chosenItem = result[i];
                    }
                };
                if (chosenItem.stock_quanity > parseInt(answer.howMuch)) {
                    var diff = chosenItem.stock_quanity - parseInt(answer.howMuch);
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quanity: diff
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            var total=chosenItem.price*parseInt(answer.howMuch);
                            console.log("Item ordered successfully! Your total is: $"+total+"\n--------------------------------------");
                            again();
                        }
                    );
                }
                else {
                    console.log("\nSorry we don't have enough of that item.....We have " + chosenItem.stock_quanity + " in stock.");
                    console.log('------------------------------------------------------------------\n');
                    again();
                };
            });
    });
};

function again() {
    inquirer
        .prompt([
            {
                name: "tryAgain",
                type: "confirm",
                message: "Would you like to buy something else?"
                }
        ])
            .then(function (ans) {
                if(ans.tryAgain){
                    start();
                }
                else{
                    connection.end();
                }
            });
};