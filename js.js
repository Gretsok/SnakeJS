var canvas = document.getElementById('playscreen');
var ctx = canvas.getContext('2d');
ctx.fillStyle = "#00FF00";

let gameRunning = false;
document.getElementById("youdead").hidden= true;

//Audio
let music = new Audio("audio/elevatormusic.mp3");

let fruitAudio =new Audio("audio/Son_Fruit.mp3");
let deathAudio =new Audio("audio/Son_Mort.mp3");


function playMusic()
{
    music.volume = 0.05;
    music.play();
}

playMusic();


let EMPTY = 0;
let FOOD = 1;
let WALL = 2;
let SNAKE = 3;
let snakeBody = [];

//player stats
let score = 0;
let scoreDisplay = document.getElementById("score");
scoreDisplay.hidden=true;

// Snake movements boolean
let goesUp = false;
let goesDown = false;
let goesRight = false;
let goesLeft = false;
let snakeDirection = "L";

//ctx.fillRect(canvas.width/4, canvas.height/4, 10, 10);
let delay = 1000;
let WORLD = [
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, FOOD,  EMPTY, EMPTY],
    [EMPTY, SNAKE, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, SNAKE, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, SNAKE, SNAKE, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  ];
let caseSize = 20;


function LoadLevel(level)
{

    let req = new XMLHttpRequest();
    req.open("GET", "levels/level" + level + ".json");

    req.onerror = function() {
        console.log("Échec de chargement "+"levels/level" + level + ".json");
    };
    req.onload = function() {
        if (req.status === 200) {
            let data = JSON.parse(req.responseText);
            // do what you have to do with 'data'

            //size of cases
            caseSize = data.caseSize;

            // Resizing canvas
            canvas.width = data.dimensions[0]*caseSize;
            canvas.height = data.dimensions[1]*caseSize;

            // Resizing the WORLD Array
            WORLD = Array(data.dimensions[0]);
            for(let i=0; i<data.dimensions[0]; i+=1)
            {
                WORLD[i] = Array(data.dimensions[1]);
            }

            // Filling WORLD with EMPTY values
            for(let i=0; i < data.dimensions[0]; i+=1)
            {
                for(let j=0; j < data.dimensions[1]; j+=1)
                {
                    WORLD[i][j] = EMPTY;
                }
            }

            // Setting up Delay
            console.log("delay -> " + data.delay);
            delay = data.delay;
            

            
            //Placing walls
            let nbOfWalls = data.walls.length;
            for(let i =0; i < nbOfWalls; i+=1)
            {
              WORLD[data.walls[i][0]][data.walls[i][1]] = WALL;
            }
            

            //Placing food
            let nbOfFood = data.food.length;
            for(let i = 0; i< nbOfFood; i+=1)
            {
                WORLD[data.food[i][0]] [data.food[i][1]] = FOOD;
            }
            
            
            //placing snake
            let snakeLength = data.snake.length;
            snakeBody.length = snakeLength;
            for(let i=0; i <snakeLength; i+=1)
            {
                WORLD[data.snake[i][0]] [data.snake[i][1]]=SNAKE;
                snakeBody[i] = data.snake[i];

            }

            //Starting direction
            let goesUp = false;
            let goesDown = false;
            let goesRight = false;
            let goesLeft = false;
            snakeDirection = data.startingDirection;

            //score 
            score = 0;
            scoreDisplay.textContent="Score : 0";



            console.log(WORLD);
            console.log("level load successfully");

            gameRunning = true;
            draw();
            gameLoop();
        }
        
    };

  req.send();
}

function draw()
{
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WORLD.length * caseSize, WORLD[0].length *caseSize);
    for(let i=0; i<WORLD.length ; i+=1)
    {
        for(let j=0; j<WORLD[0].length ; j+=1)
        {
            
            ctx.strokeStyle ="lightgrey";
            ctx.strokeRect(i * caseSize, j * caseSize, caseSize, caseSize);

            //console.log(WORLD[i][j] + " ");

            if(WORLD[i][j] === FOOD)
            {
                ctx.fillStyle = "red";
                ctx.fillRect(i * caseSize, j * caseSize, caseSize, caseSize);
            }
            else if(WORLD[i][j] === WALL)
            {
                ctx.fillStyle = "black";
                ctx.fillRect(i * caseSize, j * caseSize, caseSize, caseSize);
            }
            else if(WORLD[i][j] === SNAKE)
            {
                ctx.fillStyle = "green";
                ctx.fillRect(i * caseSize, j * caseSize, caseSize, caseSize);
            }
        }
        
    }
   
}

document.addEventListener('keydown', move);

function move(key)
{
    if(key.code === "ArrowDown")
    {
        goesDown = true;
        goesLeft = false;
        goesRight = false;
        goesLeft = false;
    }
    else if(key.code ==="ArrowUp")
    {
        goesUp = true;
        goesLeft = false;
        goesDown = false;
        goesRight = false;
    }
    else if(key.code ==="ArrowLeft")
    {
        goesLeft = true;
        goesRight = false;
        goesUp = false;
        goesDown = false;
    }
    else if(key.code ==="ArrowRight")
    {
        goesRight = true; 
        goesLeft = false;
        goesUp = false;
        goesDown = false;
    }

}

function spawnFood()
{
    fruitAudio.play();
    let x = Math.floor(Math.random()*WORLD.length);
    let y = Math.floor(Math.random()*WORLD[0].length);
    while(WORLD[x][y] != EMPTY)
    {
        let x = Math.floor(Math.random()*WORLD.length);
        let y = Math.floor(Math.random()*WORLD[0].length);
    }
    WORLD[x][y] = FOOD;
}

function die()
{   
    document.getElementById("youdead").hidden = false;
    deathAudio.play();
    gameRunning=false;
    console.log("Youre dead");
}

function gameplay()
{
    let snakeHead = snakeBody[0];
    let snakeTail = snakeBody[snakeBody.length-1];
    
    if(goesUp && snakeDirection != "D")
    {
        snakeDirection = "U";
    }
    if(goesDown && snakeDirection != "U")
    {
        snakeDirection="D";
    }
    if(goesLeft && snakeDirection != "R")
    {
        snakeDirection="L";
    }
    if(goesRight && snakeDirection != "L")
    {
        snakeDirection="R";
    }

    //console.log(snakeDirection + "goesUp: " + goesUp + " goesDown: "+ goesDown + " goesLeft: " + goesLeft + " goesRight : " + goesRight);
    if(snakeDirection === "U")
    {

        
        //goesUp = false;
        if(WORLD[snakeHead[0]][snakeHead[1]-1] === EMPTY)
        {
            WORLD[snakeTail[0]][snakeTail[1]] = EMPTY;
            snakeBody.pop(); 
        }
        else if(WORLD[snakeHead[0]][snakeHead[1]-1] === FOOD)
        {
            spawnFood();
            score = score+1;
            scoreDisplay.textContent = " Score : " + score;
        }
        else
        {
            die();
        }
        //Il se déplace
        WORLD[snakeHead[0]][snakeHead[1]-1] = SNAKE;
        newPos = [snakeHead[0], snakeHead[1]-1];
        snakeBody.unshift(newPos);
    }

    if(snakeDirection === "D")
    {

        //goesDown = false;
        if(WORLD[snakeHead[0]][snakeHead[1]+1] === EMPTY)
        {
            WORLD[snakeTail[0]][snakeTail[1]] = EMPTY;
            snakeBody.pop(); 
        }
        else if(WORLD[snakeHead[0]][snakeHead[1]+1] === FOOD)
        {
            spawnFood();
            score = score+1;
            scoreDisplay.textContent = " Score : " + score;
        }
        else
        {
            die();
        }
        //Il se déplace
        WORLD[snakeHead[0]][snakeHead[1]+1] = SNAKE;
        newPos = [snakeHead[0], snakeHead[1]+1];
        snakeBody.unshift(newPos);
        
    }
    if(snakeDirection === "R")
    {        
        if(snakeHead[0]+1 >= WORLD.length-1)
        {
            die();
        }
        //goesRight = false;
        if(WORLD[snakeHead[0]+1][snakeHead[1]] === EMPTY)
        {
            WORLD[snakeTail[0]][snakeTail[1]] = EMPTY;
            snakeBody.pop(); 
        }
        else if(WORLD[snakeHead[0]+1][snakeHead[1]] === FOOD)   
        {
            spawnFood();
            score = score+1;
            scoreDisplay.textContent = " Score : " + score;
        }
        else
        {
            die();
        }
        //Il se déplace
        WORLD[snakeHead[0]+1][snakeHead[1]]  = SNAKE;
        newPos = [snakeHead[0]+1, snakeHead[1]] ;
        snakeBody.unshift(newPos);
        
    }
    if(snakeDirection === "L")
    {

        if(snakeHead[0]-1 <= 0)
        {
            die();
        }
        if(WORLD[snakeHead[0]-1][snakeHead[1]] === EMPTY)
        {
            WORLD[snakeTail[0]][snakeTail[1]]  = EMPTY;
            snakeBody.pop(); 
        }
        else if(WORLD[snakeHead[0]-1][snakeHead[1]] === FOOD)
        {
            spawnFood();
            score = score+1;
            scoreDisplay.textContent = " Score : " + score;
        }
        else
        {
            die();
        }
         //Il se déplace
         WORLD[snakeHead[0]-1][snakeHead[1]]  = SNAKE;
         newPos = [snakeHead[0]-1, snakeHead[1]] ;
         snakeBody.unshift(newPos);
    }
    
    
}

function gameLoop()
{
    if(gameRunning)
    {
        gameplay();
        draw();
        setTimeout(gameLoop, delay);
    }   
}
/*
function start_loop() {
    if (!gameRunning) {
        gameRunning = true;
        step();
    }
}

function stop_loop() {
    gameRunning = false;
}

function step()
{
    if(gameRunning)
    {
        gameplay();
        draw();
        setTimeout(step, delay);
    }   
}
*/
//Initialisation
let hashCode = window.location.hash;
let hashSize = window.location.hash.length;
let level = "";
for(let i = 1; i < hashSize; i+=1)
{
    level += hashCode[i];
}
if(level === "0" || level == "")
{

    //Hiding game
    canvas.hidden = true;
    //Displaying menu
    document.getElementById("menu").hidden = false;
    this.document.getElementById("youdead").hidden = true;
    scoreDisplay.hidden=true;

    gameRunning = false;
}
else
{
 
    

    //Hide Menu
    document.getElementById("menu").hidden = true;
    //Display Game
    scoreDisplay.hidden=false;

    canvas.hidden = false;
    LoadLevel(level);
    draw();
    console.log("truc");
}


window.addEventListener('hashchange', function(){
    let hashCode = window.location.hash;
    let hashSize = window.location.hash.length;
    let level = "";
    for(let i = 1; i < hashSize; i+=1)
    {
        level += hashCode[i];
    }
    if(level === "0" || level == "")
    {

        //Hiding game
        canvas.hidden = true;
        //Displaying menu
        document.getElementById("menu").hidden = false;
        this.document.getElementById("youdead").hidden = true;
        scoreDisplay.hidden=true;

        gameRunning = false;
    }
    else
    {


        //Hide Menu
        document.getElementById("menu").hidden = true;
        //Display Game
        scoreDisplay.hidden=false;

        canvas.hidden = false;
        LoadLevel(level);
        draw();
        console.log("truc");
    }
    
  });
console.log(WORLD[5][5]);
  //draw();
