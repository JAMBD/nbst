var pattern = document.createElement("canvas");
var game_width = 10;
var game_height = 20;
var game = [];

var active_position = [game_width/2, 0];
var active_block = -1;
var active_rotation = -1;
var empty_colour = "#222";

var max_level = 15;
var line_count = 0;
var line_stat = [0,0,0,0];
var delay = max_level;
var time_to_move = 0;
var game_over = false;

var up_coming = [];
var n_future = 5;

var hold = [-1, -1];
var hold_used = false;

var shadow_effect = 1;

// #
// #      #    #
// #  ##  #    #   ##  ##     #
// #  ##  ##  ##  ##    ##   ###
var colours = [
  "#922",
  "#292",
  "#229",
  "#992",
  "#929",
  "#299",
  "#999",
];
var blocks = [
  [[-1.5,  0.0],[-0.5,  0.0],[ 0.5,  0.0],[ 1.5,  0.0]],
  [[-0.5, -0.5],[-0.5,  0.5],[ 0.5, -0.5],[ 0.5,  0.5]],
  [[ 0.0, -0.5],[-1.0, -0.5],[ 1.0, -0.5],[-1.0,  0.5]],
  [[ 0.0,  0.5],[-1.0,  0.5],[ 1.0,  0.5],[-1.0, -0.5]],
  [[-0.5,  0.0],[ 0.5,  0.0],[ 0.5,  1.0],[-0.5, -1.0]],
  [[-0.5,  0.0],[ 0.5,  0.0],[-0.5,  1.0],[ 0.5, -1.0]],
  [[-0.5,  0.0],[ 0.5,  0.0],[ 0.5,  1.0],[ 0.5, -1.0]],
];


function genBlock(b, r){
  var rlt = [];
  for (var i = 0; i < 4; i++){
    var s_x = blocks[b][i][0];
    var s_y = blocks[b][i][1];
    switch(r){
      case 0:
        break;
      case 1:
        var tmp = s_x;
        s_x = -s_y;
        s_y = tmp;
        break;
      case 2:
        s_x = -s_x;
        s_y = -s_y;
        break;
      case 3:
        var tmp = s_x;
        s_x = s_y;
        s_y = -tmp;
        break;
    }
    rlt.push([Math.round(s_x), Math.round(s_y)]);
  }
  return rlt;
}


function checkMove(dr, dx, dy, update=true){
  var new_r = active_rotation + dr;
  new_r %= 4;
  var new_x = active_position[0] + dx;
  var new_y = active_position[1] + dy;
  var block = genBlock(active_block, new_r);
  var valid = true;
  for (var i = 0; i < 4 && valid; i++){
    var nb_x = block[i][0] + new_x;
    var nb_y = block[i][1] + new_y;
    if (nb_x < 0)
      valid = false;
    if (nb_x >= game_width)
      valid = false;
    if (nb_y >= game_height)
      valid = false;
    if (nb_y < 0)
      continue;
    if (game[nb_x + nb_y * game_width] != -1)
      valid = false;
  }
  if (valid && update){
    active_position[0] = new_x;
    active_position[1] = new_y;
    active_rotation = new_r;
  }
  return valid;
}

function activate_block(b, r){
  var n_blk = genBlock(b, r);
  var lowest = 0;
  for (var i = 0; i < 4; i++){
    if (n_blk[1] > lowest)
      lowest = n_blk;
  }
  active_position = [game_width/2, -lowest-2];
  active_block = b;
  active_rotation = r;
}

function new_block(){
  var nxt = up_coming.shift();
  while (Math.random() > 0.05);
  up_coming.push([Math.floor(Math.random() * 7), Math.floor(Math.random() * 4)]);
  activate_block(nxt[0], nxt[1]);
}

function keyDownEvent(e){
  switch(e.keyCode){
    case 81:
      if (hold_used)
        break;
      var tmp = hold;
      hold = [active_block, active_rotation];
      hold_used = true;
      if (tmp[0] == -1){
        new_block();
      }else{
        activate_block(tmp[0], tmp[1]); 
      }
      break;
    case 32: 
      //space
      if (checkMove(0, 0, 1))
        time_to_move = delay;
      while (checkMove(0, 0, 1));
      break;
    case 38: 
      checkMove(3, 0, 0);
      //up
      break;
    case 40: 
      //down
      if (checkMove(0, 0, 1))
        time_to_move = delay;
      break;
    case 39: 
      //right
      checkMove(0, 1, 0);
      break;
    case 37: 
      //left
      checkMove(0, -1, 0);
      break;
  }
}

function keyUpEvent(e){
}

function draw_pattern(ctx){
  pattern.width = 5;
  pattern.height = 5;
  var pctx = pattern.getContext("2d");
  pctx.strokeStyle = ctx.strokeStyle;
  pctx.fillStyle = ctx.fillStyle;
  pctx.fillRect(0,0,5,5);
  pctx.beginPath();
  pctx.moveTo(0,0);
  pctx.lineTo(5,5);
  pctx.moveTo(5,0);
  pctx.lineTo(0,5);
  pctx.stroke();
  ctx.fillStyle = ctx.createPattern(pattern,"repeat");
}

function setup(){
  var c = document.getElementById("game");
  window.addEventListener('keydown', keyDownEvent, false);
  window.addEventListener('keyup', keyUpEvent, false);
  window.addEventListener('resize', resizeCanvas, false);
  for (var i = 0; i < game_width * game_height; i++){
    game.push(-1);
  }
  for (var i = 0; i < n_future; i++){
    while (Math.random() > 0.05);
    up_coming.push([Math.floor(Math.random() * 7), Math.floor(Math.random() * 4)]);
  }
  new_block();
  setInterval(function() {
    update();
    draw();
  }, 30);
  resizeCanvas();
}


function draw(){
  var c = document.getElementById("game");
  var ctx = c.getContext("2d");
  var c_h = c.height;
  var c_w = c.width;
  var a_block = genBlock(active_block, active_rotation);
  ctx.clearRect(0, 0, c_w, c_h);
  if (game_over){
    ctx.fillStyle = "#210";
  }else{
    ctx.fillStyle = "#012";
  }
  ctx.fillRect(0, 0, c_w, c_h);
  var drop = 0;
  for (var i = 1; i < game_height && shadow_effect == 1; i++){
    if (!checkMove(0, 0, i, false)){
      drop = i-1;
      break;
    }
  }
  var g_s = c_h/game_height;
  var b = g_s/20;
  for (var i = 0; i < game_width; i++){
    for (var j = 0; j < game_height; j++){
      var block = game[j * game_width + i];
      var piece = empty_colour;
      if (block > -1)
        piece = colours[block];
      if (shadow_effect == 1){
        for (var k = 0; k < 4 & !game_over; k++){
          var s_x = a_block[k][0] + active_position[0];
          var ss_y = a_block[k][1] + active_position[1] + drop;
          if (i == s_x && j == ss_y)
            piece = "#555";
        }
      }
      for (var k = 0; k < 4 & !game_over; k++){
        var s_x = a_block[k][0] + active_position[0];
        var s_y = a_block[k][1] + active_position[1];
        if (i == s_x && j == s_y)
          piece = colours[active_block];
      }
      ctx.fillStyle = piece;
      ctx.fillRect((i-game_width/2.0) * g_s + c_w/2 + b/2, j*g_s + b/2, g_s-b, g_s-b);
    }
  }
  if (shadow_effect == 2){
    for (var i = 0; i < 4; i++){
      var drop = game_height - 1;
      var s_x = a_block[i][0] + active_position[0];
      var s = g_s/5;
      for (var j = game_height-1; j >= 0 ; j--){
        if (game[j * game_width + s_x] != -1)
          drop = j-1;
      }
      ctx.fillStyle = "#555";
      ctx.fillRect((s_x - game_width/2.0) * g_s + c_w/2 + b/2, drop*g_s + b/2 + g_s-s, g_s-b, s);

    }
  }

  var fg_s = c_h/game_height/2;
  var fb = g_s/20;
  for (var i = 0; i < n_future; i++){
    var a_block = genBlock(up_coming[i][0], up_coming[i][1]);
    for (var j = 0; j < 4; j++){
      var f_x = a_block[j][0];
      var f_y = a_block[j][1] + 2 + i * 5; 
      var  piece = colours[up_coming[i][0]];
      ctx.fillStyle = piece;
      ctx.fillRect(f_x * fg_s + c_w/2 + fb/2 + (game_width/2.0 + 1) * g_s, f_y*fg_s + fb/2, fg_s-fb, fg_s-fb);
    }
  }
  
  if (hold[0] != -1){
    var a_block = genBlock(hold[0], hold[1]);
    for (var j = 0; j < 4; j++){
      var f_x = a_block[j][0];
      var f_y = a_block[j][1] + 2; 
      var  piece = colours[hold[0]];
      ctx.fillStyle = piece;
      ctx.fillRect(f_x * fg_s + c_w/2 + fb/2 - (game_width/2.0 + 2) * g_s, f_y*fg_s + fb/2, fg_s-fb, fg_s-fb);
    }
  }

  var text_height = g_s/2;
  ctx.fillStyle = "#FFF";
  ctx.font = text_height.toString() + "px Arial";
  ctx.fillText("LEVEL: " + (max_level-delay).toString(), g_s, g_s * 4 + text_height);
  ctx.fillText("LINES: " + line_count.toString(), g_s, g_s*5 + text_height);
  for (var i = 0; i < 4; i++){
    ctx.fillText(" =" + (i+1).toString() + ": " + line_stat[i].toString(), g_s, g_s*5 + text_height * (i+2));
  }
  draw_pattern(ctx);
}

function resizeCanvas(){
  var ratio = 1.0;
  var c = document.getElementById("center");
  var game = document.getElementById("game");
  min_len = Math.min(window.innerWidth / ratio,window.innerHeight);
  c.width = min_len * ratio;
  c.height = min_len;
  c.style.width = min_len * ratio + 'px';
  c.style.height = min_len + 'px';
  game.width = min_len * ratio;
  game.height = min_len;
  game.style.width = min_len * ratio + 'px';
  game.style.height = min_len + 'px';
  draw();
}

function update(){
  if (game_over)
    return;
  time_to_move -= 1;
  if (time_to_move < 0){
    time_to_move = delay;
  }else{
    return;
  }
  var is_done = false;
  var valid = checkMove(0, 0, 1);
  var a_block = genBlock(active_block, active_rotation);
  for (var k = 0; k < 4 && ~is_done; k++){
    var s_x = a_block[k][0] + active_position[0];
    var s_y = a_block[k][1] + active_position[1] + 1;
    if (s_y >= game_height)
      is_done = true;
    if (game[s_x + s_y * game_width] != -1)
      is_done = true;
  }
  if (is_done & !valid){
    for (var k = 0; k < 4; k++){
      var s_x = a_block[k][0] + active_position[0];
      var s_y = a_block[k][1] + active_position[1];
      game[s_x + s_y * game_width] = active_block;
      if (s_y < 0){
        game_over = true;
      }
    }
    new_block();
    hold_used = false;
    if (! checkMove(0,0,0)){
      game_over = true;
      return;
    }
    var c_lines = 0;
    for (var i = 0; i < game_height; i++){
      var row_full = true;
      for (var j = 0; j < game_width & row_full; j++){
        if (game[i * game_width + j] == -1)
          row_full = false;
      }
      if (row_full){
        line_count ++;
        c_lines ++;
        if (line_count % 10 == 0){
          delay --;
          if (delay < 0) delay = 0;
        }
        game.splice(i * game_width, game_width);
        for (var j = 0; j < game_width; j++){
          game.unshift(-1);
        }
      }
    }
    if (c_lines > 0)
      line_stat[c_lines-1] ++;
  }
}

setup();

