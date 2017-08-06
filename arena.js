'user strict'

function max_element(a){
    //console.log(a);
    var tmp = a[0];
    for(var x of a){
        //console.log("x = " + x);
        if(x>tmp) tmp=x;
    }
    return tmp;
}

function compare(a,b){
    if (a.length===0) return false;
  else if (a.length>b.length) return true;
  else if (a.length<b.length) return false;
  else return (max_element(a) > max_element(b));
}

function red(a){
    // Highest
    var r=[];
    r.push(max_element(a));
    return r;
}

function orange(a){
    // same number
    var n =[[],[],[],[],[],[],[],[]];
    for(var x of a){
        n[Math.floor(x/10)].push(x);
    }
    var best=n[1];
    for(var i=2;i<8;i++){
        if(compare(n[i],best)) best=n[i];
    }
    return best;
}

function yellow(a){
    // same color
    var n =[[],[],[],[],[],[],[],[]];
    for(var x of a){
        n[x%10].push(x);
    }
    var best=n[1];
    for(var i=2;i<8;i++){
        if(compare(n[i],best)) best=n[i];
    }
    return best;
}

function green(a){
    // even number
    var r=[];
    for(var x of a){
        if(Math.floor(x/10)%2 === 0) r.push(x);
    }
    return r;
}

function blue(a){
    // different color
    var m_color =Array(8).fill(0);
    for(var x of a){
        if(x>m_color[x%10]) m_color[x%10]=x;
    }
    var r = [];
    for (var x of m_color) {
        if (x > 0) r.push(x);
    }
    return r;
}

function indigo(a) {
    // in a row
    var m_number = Array(8).fill(0);
    for (var x of a) {
        if (x > m_number[Math.floor(x/10)]) m_number[Math.floor(x/10)] = x;
    }

    var best = [], current = [];
    for (var i = 1; i < 8; i++) {
        if (m_number[i] === 0) current = [];
        else {
            current.push(m_number[i]);
            if (compare(current, best)) best = current;
        }
    }
    return best;
}

function violet(a) {
    // below 4
    var r = [];
    for (var x of a) {
        if (Math.floor(x/10) < 4) r.push(x);
    }
    return r;
}

var g={hands:[[],[]],palette:[[],[]],get_top:{
    7: red,
    6: orange,
    5: yellow,
    4: green,
    3: blue,
    2: indigo,
    1: violet
},current_rule:7};
var game_all={};
var game_log={};
var A={};
var B={};
let selectable = false;
A.x ="A"
B.x = "B"
A.name= "ZRT";
B.name= "Chenyao2333";
A.gid=0;
B.gid=1;
A.score=0;
B.score=0;
A.type = "log"
B.type = "log"
var round
var orderby = "number";
// remote
var roundtime = 1.5;
var round_num=0;
var start_time = 0;
var _do_operation;
var removed_cards = [];
var round_wait_time = 1.5; // 两场间隔时间
var _cid; // active cid
var _card,_rule_card; // active cards
var hideB = false; // hide op
var last_rule_card=0;
var _op_timeout = false;

var game_type;

var color={
    7: "red",
    6: "orange",
    5: "yellow",
    4: "green",
    3: "blue",
    2: "indigo",
    1: "violet"
};
var rule={
    7:"HIGHEST CARD",
    6:"CARDS OF ONE NUMBER",
    5:"CARDS OF ONE COLOR",
    4:"MOST EVEN CARDS",
    3:"CARDS OF ALL DIFFERENT COLORS",
    2:"CARDS THAT FORM A RUN",
    1:"MOST CARDS BELOW 4"
};

var rule_color={
    7:"rgb(203,38,59)",
    6:"rgb(253,166,79)",
    5:"rgb(245,224,58)",
    4:"rgb(66,173,51)",
    3:"rgb(83,208,252)",
    2:"rgb(48,130,200)",
    1: "rgb(126,72,191)"
};

function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

function testurl(key){
    var ret = getUrlVar(key);
    if(ret === "") return false;
    else return true;
}

function arrcopy(ret,a){ // ret must be []
    for(var x of a){
        ret.push(x);
    }
}

function hands2html(arr, hide, selectable){
    if(typeof(arr) === 'number') arr = g.hands[arr];
    if(orderby === 'number'){
        // number
        arr.sort(function(a,b){
            var xa = parseInt(a/10);
            var xb = parseInt(b/10);
            if(xa!==xb){
                return xa-xb;
            }else{
                return a%10- b%10  ;
            }
        })
    }else{
        // color
        arr.sort(function(a,b){
            if(a%10 !== b%10){
                return  a%10-b%10 ;
            }else{
            var xa = parseInt(a/10);
            var xb = parseInt(b/10);
                return xa-xb;
            }
        })

    }
    var ret=""
    for( var x of arr){
        var c = x%10;
        var n = parseInt(x/10);
        if(hide === true){
            ret+=`<div class="card-lg card-${color[c]} card-${n}  card-hand" id="card${x}" onclick="select_card(${x})" style="width:60px;"> <img src="./static/img/hide.png" width=100%>   </div>`
        }else{
            if(selectable === true){
                ret+=`<div class="card-lg card-${color[c]} card-${n}  card-hand" id="card${x}" onclick="select_card(${x})" style="width:60px;cursor:pointer;"> <img src="./static/img/cards/${x}.png" width=100%>   </div>`
            }else{
                ret+=`<div class="card-lg card-${color[c]} card-${n}  card-hand" id="card${x}" onclick="select_card(${x})" style="width:60px;cursor:default;"> <img src="./static/img/cards/${x}.png" width=100%>   </div>`
            }
            
        }
        
    }
    return ret
}

function palette2html(arr){
    if(typeof(arr) === 'number') arr = g.palette[arr];
    var rule = _rule_card || last_rule_card || 77;
    rule = rule % 10;
    highest = g.get_top[rule](arr);
    console.log('rule:'+rule + ' '+highest)
    var ret=""
    for(var x of arr ){
        var c = x%10;
        var n = parseInt(x/10);
        var highlight = '';
        if(highest.indexOf(x) >= 0){
            highlight = 'highlight';
        }
        ret+=`<div class="card-sm card-${color[c]} card-${n} card-palette ${highlight}" id="card${x}" style="width:40px;"> <img src="./static/img/cards-sm/${x}.png" width=100%></div>`
    }
    return ret
}

function activebtn(btn){
    $(btn).removeClass('disabled');
    $(btn).addClass('btn-raised');
}
function disablebtn(btn){
    $(btn).addClass('disabled');
    $(btn).removeClass('btn-raised');
}



function render_init(){
    $('#nameA').html('<nobr>'+A.name+'</nobr>');
    $('#nameB').html('<nobr>'+B.name+'</nobr>');
    $('#scoreA').text(A.score);
    $('#scoreB').text(B.score);
// 是否要给牌排序
    
    $("#handA").html(hands2html(A.gid,false,selectable));
    $("#handB").html(hands2html(B.gid,hideB,false));

    $("#paletteA").html(palette2html(A.gid));
    $('#paletteB').html(palette2html(B.gid));
    
    $('#rule').html(`<div><img src="./static/img/cards/${last_rule_card}.png" height=40px> </div>`+`<div class="rule-text">${rule[g.current_rule]}</div>`)
    $('#rule').css('color',rule_color[g.current_rule])
}

function show_win(winner){
    $.alert({
        title: `${winner.name} win!`,
        content: `${winner.name} win this round! Next round will start in ${round_wait_time}s.`,
        autoClose: `close|${round_wait_time *1000 -1000}`,
        buttons:{
            close : function(){
                console.log('message_box close');
            }
        }
    })
    
}

function do_timeout(X,do_operation) {
    $('#clock'+X.x).text('');
    //不用干
}

function getNow(){
    var  _date = new Date();
    return _date.getTime();
}

function start_clock(r,X,do_operation){
    var end_time = getNow() + X.roundtime * 1000;
    function update_clock(){
        var now = getNow();

        if(round_num !== r){
            $('#clock'+X.x).text('');
            return;
        }
        if(now> end_time){
            do_timeout(X,do_operation);
            return;
        }
        $('#clock'+X.x).html('<div style="margin-right:4px;"><i class="material-icons">alarm</i></div>'+'<div style="font-size:1.2em;">'+parseInt((end_time-now)/1000)+'</div>');
        setTimeout(update_clock,200);
    }
    setTimeout( update_clock , 0);

}

function Run(X,nxtX){
    console.log('Run '+X.gid);
    var r = round_num;

    var do_operation = function(card,rule_card){
        if(r!==round_num) return;
        round_num += 1;
        selectable = false;
        if(typeof(card)!=='number' || !(card>=0 && card<=77)){
            card = 0;
        }
        if(typeof(rule_card)!=='number'||!(rule_card>=0 && rule_card<=77)){
            rule_card = 0;
        }
        if (nxtX.type == "remote") {
            ipcRenderer.send("debug", "before forward");
            ipcRenderer.send("forward", nxtX.name, "do_operation", [card, rule_card]);
            ipcRenderer.send("debug", "after forward")
        }
        var ret = g.play(X.gid,card,rule_card);
        if(ret === false){
            show_win(nxtX);
            var sc = 0;
            var highest = g.get_player_highest(nxtX.gid, 0);
            highest.map(function(x){
                removed_cards.push(x);
                sc += parseInt(x/10);
            })
            nxtX.score += sc;
            $('#scoreA').text(A.score);
            $('#scoreB').text(B.score);
            // 设置 start_time
            start_time = getNow()+round_wait_time*1000;
            start();
        }else{
            //加动画 鲁棒的动画
            if(rule_card>0) {
                _rule_card = 0;
                last_rule_card = rule_card;
            }
            render_init();
            Run(nxtX,X);
        }

    }
    
    _do_operation = do_operation;

    // 开计时器
    // 如果是A并且human监听操作，
    // 如果是bot，调mybot获取操作，并执行。
    // 如果B是remote,调网络库获取操作，并执行。
    start_clock(round_num,X,do_operation);
    if(X.type === "bot"){
        var bot = new Bot(X.bot_path);
        bot.run(g.gen_input(X.gid), X.roundtime * 1000, function (err, card, rule_card) {
            if (err !== 0) {
                console.log("error: " + err+' '+card+' '+rule_card);
                setTimeout(function () {
                    _do_operation(0, 0);
                }, 0);
            }
            console.log("do operation card = " + card + "\trule_card = " + rule_card);
            setTimeout(function () {
                _do_operation(card, rule_card);
            }, AI_wait_time);
        });
    }else if(X.type === "human"){
        selectable = true;
        render_init();
        _card = _rule_card = 0 ;
        _hands = [];
        arrcopy(_hands,g.hands[X.gid]);
        _palette = [];
        arrcopy(_palette,g.hands[X.gid]);
        $('#op-pan').show();
        
    }else if(X.type === "remote"){
        ipcRenderer.once("do_operation", function (e, [card, rule_card]) {
            console.log("in chenyao's sb do_operation " + card + " " + rule_card);
            _do_operation(card, rule_card);
        });
        ipcRenderer.send("register", "do_operation");
    }

}

function start(){
    $('#op-pan').hide();
    if(A.score >= 40 || B.score >=40){
        //处理获胜。
        var winner;
        if(A.score>B.score){
            winner =A;
        }else winner = B;
        
        if(_op_timeout){
            winner = A;
            
            $.alert({
                title: `${winner.name} win!`,
                content: `${B.name} left. ${winner.name} win this game! Automatic return in ${return_wait_time}s.`,
                autoClose: `close|${return_wait_time*1000 -1000}`,
                buttons:{
                    close : function(){
                        console.log('message_box close');
                    }
                }
            })
        }else{
            $.alert({
                title: `${winner.name} win!`,
                content: `${winner.name} win this game! Automatic return in ${return_wait_time}s.`,
                autoClose: `close|${return_wait_time*1000 -1000}`,
                buttons:{
                    close : function(){
                        console.log('message_box close');
                    }
                }
            })


        }
        

        setTimeout(function() {
            location.href = './matching.html?'+$.param(backparam);
        }, return_wait_time*1000);

        var botlist = JSON.parse(localStorage.getItem('botlist'));
        if(A.type === 'bot'){
            //console.log(botlist[A.botid]);
            if(winner.x === 'A')
                botlist[A.botid].win+=1;
            botlist[A.botid].play_num+=1;
        }
        if(B.type === 'bot'){
            //console.log(botlist[B.botid]);
            if(winner.x === 'B')
                botlist[B.botid].win+=1;
            botlist[B.botid].play_num+=1;
        }
        save_botlist(botlist);
        console.log('获胜');
        
        return;
    }

    if (A.gid === 0) [score_0, score_1] = [A.score, B.score];
    else [score_1, score_0] = [A.score, B.score];
    g = new Red7(2, removed_cards, score_0, score_1);
    last_rule_card = 0;
    _cid=0;
    _card = _rule_card =0;
    

    var _do = function() {
        if(getNow()>start_time){
            render_init();
            var current_gid = (g.get_winner(0)+1)%g.num_players;
            if(current_gid === A.gid) Run(A,B);
            else Run(B,A);
            return;
        }else{
            setTimeout(_do, 100);
        }
   }

    if(B.type === "remote"){
        if (A.name < B.name) {
            ipcRenderer.send("forward", B.name, "set_g", g);
            A.gid = 0;
            B.gid = 1;
            _do();
        } else {
            A.gid = 1;
            B.gid = 0;
            ipcRenderer.once("set_g", function (e, rg) { 
                g.current_rule = rg.current_rule;
                g.hands = rg.hands;
                g.palette = rg.palette;
                _do();
            });
            ipcRenderer.send("register", "set_g");
        }
    } else {
        _do();
    }
    
}

var lognow;

// ?url=233&game_type=log&player=jc_zxy_rzz+VS+lby_wsy_qyx&gameid=2
function receive(){
    var url = testurl('url');
    if(url){
        game_type = getUrlVar('game_type');
        if(game_type === 'log'){
            var player = getUrlVar('player');
            var gameid = getUrlVar('gameid');
            gameid = parseInt(gameid)

            // AJAX获取log

            $.ajax({
                url:"/logs/"+player+".json",
                type:"get",
                timeout:"20000",
                dataType:"json",
                success: function (data,status){
                    if(status !== "success"){
                        alert('[!] '+status);
                        return;
                    }
                    game_all = data
                    A.name = data.name_0
                    B.name = data.name_1
                    A.gid = 0
                    B.gid = 1
                    hideB = false
                    A.type = "log"
                    B.type = "log"

                    console.log(data)
                    render_init();

                    round=data.rounds[gameid];
                    lognow = getNow()+1000;
                    
                    play_log(0);

                }
            });

        }else{
            console.log('[!] game_mode error')
        }
    }
}

$(receive)

function play_log(x){
    if(x>=round.details.length) return;
    $.ajax({
        url:"/logs/"+round.details[x].log,
        type:"get",
        timeout:"20000",
        dataType:"json",
        success:function(data,status){
            console.log(data);
            for(var i=0;i<data.details.length;i++){
                let dd = data.details[i]
                setTimeout(function(){
                    
                    console.log(dd)
                    g.hands[0] = dd.hand_0
                    g.hands[1] = dd.hand_1
                    g.palette[0] = dd.palette_0
                    g.palette[1] = dd.palette_1
                    g.current_rule = dd.rule%10
                    last_rule_card = dd.rule
                    if(last_rule_card === 7) last_rule_card = 0
                    render_init();
                },lognow-getNow());
                lognow+=roundtime*1000;
            }
            setTimeout(function(){
                var winner = game_all["name_"+data.winner]
                $.alert({
                    title: `${winner} win!`,
                    content: `${winner} win this round! Next round will start in 3s.`,
                    autoClose: `close|${2 *1000 -500}`,
                    buttons:{
                        close : function(){
                            console.log('message_box close');
                        }
                    }
                })
                if(data.winner === 0){
                    A.score += data.winning_score;
                }else{
                    B.score += data.winning_score;
                }
                render_init();
            },lognow-getNow())
            lognow += 2000
            play_log(x+1)
        }
    })

    
}


