
//versitileArg is toGetOrToCallOrParentOrParentWidth
$.fn.actor = function(versitileArg,parentHeight) {
    var args = Array.prototype.slice.apply(arguments, [1]);

    var Actor = function(el,versitileArg,parentHeight){
        this.el = el;
        this.refresh(versitileArg,parentHeight);
    };
    Actor.prototype.refresh = function(versitileArg,parentHeight){
        this.getSize();
        this.getCenter();
        this.getCenterWithin(versitileArg,parentHeight);
    };
    Actor.prototype.getSize = function(){
        this.size = {
            x: this.el.outerWidth(),
            y: this.el.outerHeight()
        };
        this.width = this.size.x;
        this.height = this.size.y;
    };
    Actor.prototype.getCenter = function(){
        this.center = {
            x: this.width/2,
            y: this.height/2
        };
        this.centerX = this.center.x;
        this.centerY = this.center.y;
    };
    Actor.prototype.getCenterWithin = function(versitileArg,parentHeight){
        
        var parentWidth = 0;
        if(typeof versitileArg === 'object'){
            parentWidth = versitileArg.outerWidth();
            parentHeight = versitileArg.outerHeight();
        } else if (typeof versitileArg === 'undefined'){
            parentHeight = 0;
        } else {
            parentWidth = +versitileArg;
            parentHeight = parentHeight ? +parentHeight : 0;
        }
        this.centerWithin = {
            'x':(parentWidth/2) - this.centerX,
            'y':(parentHeight/2) - this.centerY
        };
        this.centerWithinX = this.centerWithin.x;
        this.centerWithinY = this.centerWithin.y;


    };
    var toReturn;
    var chain = this.each(function() {
        var el = $(this);
        var inst = el.data('actor');
        if(!inst) {
            el.data('actor', new Actor(el,versitileArg,parentHeight));
        } else {
            if(!versitileArg){
                toReturn = inst;
            } else if(typeof inst[versitileArg] === 'function'){
                inst[versitileArg].apply(this,args);
                toReturn = inst;
            } else {
                toReturn = inst[versitileArg]
            }
            
        }
    });
    return toReturn ? toReturn : chain;
};




;(function(){

    var drawFrame = function(context,isInitial) {
        if(context.cbsCount > 0){
            context.running = true;
            window.requestAnimationFrame(function(){drawFrame(context)});
            // the first frame would  get a headstart, otherwise,
            // in below scenario, el1 is out of sync by one frame from el2 and el3
            // el1.loopCb(anim)
            // el2.loopCb(anim)
            // el3.loopCb(anim)
            if(!isInitial){
                context.doCbs(context);
            }
        } else {
            context.running = false;
        }
    };

    var Loop = function(){
        this.cbs = {};
        this.cbsCount = 0;
        this.id = 0;
        this.running = false;
    };
    Loop.prototype.doCbs = function(){
        for(var key in this.cbs){
            this.cbs[key]();
        }
    };
    Loop.prototype.killCb = function(id){
        if(this.cbs[id]){
            delete this.cbs[id];
            this.cbsCount = this.cbsCount - 1;
        }
    };
    Loop.prototype.registerCb = function($el,cb){
        var self = this;
        var id = this.id++;
        $el.data('loopId',this.id++);
        this.cbs[id] = cb;
        this.cbsCount = this.cbsCount + 1;
        ;(function(id){
            $el.on('$destroy',function(){
                self.killCb(id)
            });
        })(id);
        if(!this.running){
            drawFrame(this,true);
        }

        return id;
    };

    var loop = new Loop();

    $.fn.loopCb = function(cb) {
        var toReturn;
        var inst = this.data('loopCbId');
        if(inst) {
            loop.killCb(inst);
        }
        inst = loop.registerCb(this,cb);
        this.data('loopCbId', inst);
        return inst;
    };
})();

window.myUtils = (function(){
    var MyUtils = function(){};
    MyUtils.prototype.radians = function(degrees){
        return degrees * Math.PI / 180;
    };
    MyUtils.prototype.degrees = function(radians){
        return degrees = radians * 180 / Math.PI;
    };
    MyUtils.prototype.sinDeg = function(degrees){
        return Math.sin(this.radians(degrees))
    };
    MyUtils.prototype.cosDeg = function(degrees){
        return Math.cos(this.radians(degrees))
    };
    MyUtils.prototype.tanDeg = function(degrees){
        return Math.tan(this.radians(degrees))
    };
    MyUtils.prototype.asinDeg = function(ratio){
        return this.degrees(Math.asin(ratio));
    };
    MyUtils.prototype.acosDeg = function(ratio){
        return this.degrees(Math.acos(ratio));
    };
    MyUtils.prototype.atanDeg = function(ratio){
        return this.degrees(Math.atan(ratio));
    };
    MyUtils.prototype.atan2Deg = function(y,x){
        return this.degrees(Math.atan2(y,x));
    };

    MyUtils.prototype.hypot = function(a,b){
        return Math.sqrt(
            Math.pow(a,2) +
            Math.pow(b,2)
        );
    };
    MyUtils.prototype.getOffsetKeys = function(o){
        return typeof o['top'] !== 'undefined' ? {x:'left',y:'top'} : {x:'x',y:'y'}
    };

    MyUtils.prototype.distance = function(o1,o2){
        var o1Keys = this.getOffsetKeys(o1);
        var o2Keys = this.getOffsetKeys(o2);
        return this.hypot(o1[o1Keys.x] - o2[o2Keys.x],o1[o1Keys.y] - o2[o2Keys.y])
    };


    MyUtils.prototype.bob = function(useCos){
        var dir = useCos ? 'cos' : 'sin';
        var Bob = function(){
            this.angle = 0;
        };
        Bob.prototype.tick = function(){
            var toReturn = Math[dir](this.angle);
            this.angle += 0.1;
            return toReturn;
        };
        return new Bob();
    };

    MyUtils.prototype.circle = function(useCos){
        var dir = useCos ? 'cos' : 'sin';
        var Bob = function(){
            this.angle = 0;
        };
        Bob.prototype.tick = function(){
            //When coding animations, almost any time you are talking about x, 
            //you should immediately think cosine, 
            //and you should almost always connect y with sine.
            var toReturn = {
                x: Math['cos'](this.angle),
                y: Math['sin'](this.angle)
            };
            this.angle += 0.1;
            return toReturn;
        };
        return new Bob();
    };
    


    return new MyUtils();
})();
