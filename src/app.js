/**
 * Module dependencies.
 */
var path = require('path') ;
var render = require('./lib/render');
var parse = require('co-body');
var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var convert = require('koa-convert') ;
var serve = require('koa-static');
var app = koa();

//app locals register
app.locals = Object.assign(app.locals||{},{
    static_url : GLOBAL.process.env.STATIC_URL || '.' ,
    // cache : "memory" , //fix https://github.com/tj/consolidate.js/pull/134 bug.
}) ;

// middleware

app.use(logger());

app.use( serve( path.join(  __dirname , 'public' )  ) ) ;

// var st = serve( path.join(  __dirname , 'public' ) ) ;
// var st = serve( path.join(  __dirname , 'public' ) ) ;
// app.use( route.get('/public' , st ) ) ;

// app.use( serve( path.join(  __dirname , 'public' ) ) ) ;
// app.use( route.get( '/lib/:' , serve( path.join(  __dirname , 'lib' ) ) ) ) ;
// app.use( serve( path.join(  __dirname , 'lib' ) ) ) ;
// app.use( route.get( '/views' , serve( path.join(  __dirname , 'views' ) ) ) ) ;
// app.use( serve( path.join(  __dirname , 'views' ) ) ) ;

// route middleware
app.use(route.get('/', index));
app.use(route.get('/process', process ));
app.use(route.get('/engagement/:id', engagement ));


// route definitions

function *index(){
    this.body = yield render( 'index' ,{
        title : '首页' ,
        meta : {
            keyword : 'dashboard' ,
            description : 'pwc项目管理' ,
        } ,
        local : app.locals ,
    }) ;
}

function *process(){
    this.body = yield render( 'process' ,{
        local : app.locals ,
    }) ;
}

function  *engagement(id) {
    var engegementId = id ;
    if ( typeof id === 'undefined' ){
        this.throw( 404 , 'invalid engagement' ) ;
    }
    this.body = yield render( 'engagement' ,{
        id : id ,
        local : app.locals ,
    }) ;
}


module.exports = app ;