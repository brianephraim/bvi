

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
        this.temp = {};

    };

    var Loop = function(){
        this.cbs = {};
        this.cbsCount = 0;
        this.id = 0;
        this.running = false;
        this.temp = {};
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
        console.log(this.cbs)
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

    $.fn.loopCb = function(cb,keyToStoreTemp,tempVal) {
        if(typeof cb !== 'function'){
            if(keyToStoreTemp){
                loop.temp[keyToStoreTemp] = tempVal;
            }
        }
        var toReturn;
        var inst = this.data('loopCbId');
        if(!cb && inst) {
            loop.killCb(inst);
        }
        inst = loop.registerCb(this,cb);
        this.data('loopCbId', inst);
        return inst;
    };
})();

window.myUtils = (function(){
    var MyUtils = function(){};
    MyUtils.prototype.propertyAt = function index(objx, at, value) {
        if (typeof at == 'string') {
            at = at.replace(/\[(\w+)\]/g, '.$1');

            return index(objx, at.split('.'), value);

        } else if (at.length == 1 && value !== undefined) {
            return objx[at[0]] = value;
        } else if (at.length == 0) {
            return objx;
        } else {
            if (typeof objx[at[0]] === 'undefined') {
                if(at.length > 1){
                    objx[at[0]] = {};
                }
            }
            return index(objx[at[0]], at.slice(1), value);
        }
    };
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

    MyUtils.prototype.getDegreesFromTwoPoints = function(coords1,coords2){
        var delta = {
            x:coords1.x - coords2.x,
            y:coords1.y - coords2.y
        }
        return this.atan2Deg(delta.y,delta.x)
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

    var limitLogCount = 0;
    var lastLimitLog = '';
    var limitLog = function(){
        var j = Array.prototype.join.call(arguments, ', ');
        if(limitLogCount % 500 === 0){
            console.log(j)
        }
            
        
        limitLogCount++;
    };    

    MyUtils.prototype.setVelocity = function(settings){
        
        
        var util = this;
        var VelocityManager = function(){
            this.update(settings);
        };
        VelocityManager.prototype.update = function(settings){
            if(settings.angle || settings.degrees || settings.radians){
                settings.degrees = settings.angle ? settings.angle : settings.degrees;
                settings.radians = typeof settings.degrees  !== 'undefined' ? util.radians(settings.degrees) : settings.radians;
                settings.speed = typeof settings.speed !== 'undefined' ? settings.speed : 0;
                settings.x = Math.cos(settings.radians) * settings.speed;
                settings.y = Math.sin(settings.radians) * settings.speed;
            }
            this.velocities = settings;
        };
        VelocityManager.prototype.tick = function(coords,inputCoordsRef){
            for(var axisOrWhatev in coords){
                var velocitiesValue = this.velocities[axisOrWhatev];
                var upcomingCoordsValue = coords[axisOrWhatev] + (typeof velocitiesValue !== 'undefined' ? velocitiesValue : 0);
                
                if(inputCoordsRef ){
                    var delta = coords[axisOrWhatev] - inputCoordsRef[axisOrWhatev];
                    var futureDelta = upcomingCoordsValue - inputCoordsRef[axisOrWhatev];
                    if(delta === 0){
                        upcomingCoordsValue = coords[axisOrWhatev];
                    } else if(delta < 0){
                        upcomingCoordsValue = futureDelta >= 0 ? coords[axisOrWhatev] : upcomingCoordsValue;
                    } else{
                        upcomingCoordsValue = futureDelta <= 0 ? coords[axisOrWhatev] : upcomingCoordsValue;
                    }
                }
                coords[axisOrWhatev] = upcomingCoordsValue;
            }
            return coords;
        };
        return new VelocityManager();
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

    // vector is magnitude and direction
    // velocity is speed(magnitude) in a particular direction 

    


    return new MyUtils();
})();



//versitileArg is toGetOrToCallOrParentOrParentWidth
$.fn.actor = function(versitileArg,parentHeight) {
    var args = Array.prototype.slice.apply(arguments, [1]);

    var Actor = function(el,versitileArg,parentHeight){
        this.el = el;
        this.refresh(versitileArg,parentHeight);
        this.transformSettings = {};
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
    Actor.prototype.getOffset = function(force){
        if(!this.offset || force){
            var offset = this.el.offset();
            this.offset = !this.offset ? {}: this.offset;
            this.offset.x = offset.left;
            this.offset.y = offset.top
        }
        return this.offset;
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
    Actor.prototype.transform = function(options,dontExtend){
        /*
            options = {
                pos:{
                    x:numberOfPx
                    y:numberOfPx
                    z:numberOfPx
                },
                rot:{
                    x:numberOfDegrees
                    y:numberOfDegrees
                    z:numberOfDegrees
                }
            }
        */
        if(!dontExtend){
            $.extend(true,this.transformSettings,options)
        }

        var transformRule = '';
        // var s = options;
        var s = this.transformSettings;
        if(s.pos){
            var centerOffset = {
                x:0,
                y:0
            }
            if(s.pos.applyCenterOffset){
                centerOffset = {
                    x: this.centerX,
                    y: this.centerY
                }
            }
            if(s.pos.x){
                // $.Velocity.hook(this.el, "translateX", options.pos.x+"px");
                transformRule += ["translateX(", (s.pos.x-centerOffset.x)+"px) "].join('');
            }
            if(s.pos.y){
                // $.Velocity.hook(this.el, "translateY", options.pos.y+"px");
                transformRule += ["translateY(", (s.pos.y-centerOffset.y)+"px) "].join('');
            } 
        }
        if(s.rot){
            
            if(s.rot.x){
                // $.Velocity.hook(this.el, "rotateX", options.rot.x+"deg");
                transformRule += ["rotateX(", s.rot.x+"deg) "].join('');
            }
            if(s.rot.y){
                // $.Velocity.hook(this.el, "rotateY", options.rot.y+"deg");
                transformRule += ["rotateY(", s.rot.y+"deg) "].join('');
            } 
            if(s.rot.z){
                // $.Velocity.hook(this.el, "rotateZ", options.rot.z+"deg");
                transformRule += ["rotateZ(", s.rot.z+"deg) "].join('');
            } 
        } 
        if(transformRule){
            this.el.css('-webkit-transform',transformRule)
        } 
    };

    

    Actor.prototype.getTheoreticalTransformSetting = function(path){
        var toReturn = 0;
        var val = myUtils.propertyAt(this.transformSettings, path);
        var type = typeof val;
        if(type){
            toReturn = val;
        }
        return toReturn;
    };

    Actor.prototype.pointAt = function(inputCoordsRef,centerCoords){
        var self = this;

        if(centerCoords){
            if(centerCoords === true){
                var offset = this.getOffset();
                centerCoords = {
                    x:offset.x + self.centerX,
                    y:offset.y + self.centerY,
                };
            }
            this.primePosCoords(centerCoords);
            delete self.transformSettings.pos;
        } else {
            centerCoords = self.transformSettings.pos
        }


        var velocitySettings = {};

        this.el.loopCb(function(){
            velocitySettings.degrees = myUtils.getDegreesFromTwoPoints(inputCoordsRef,centerCoords);
            self.transform({
                rot: {z:velocitySettings.degrees}
            })
        },true);
    
    };

    Actor.prototype.primePosCoords = function(initialCoordDest){
        //if centerCoords, use those, else if transformSettings, use those, else use zero
        initialCoordDest = initialCoordDest ? initialCoordDest : {};
        var x = myUtils.propertyAt(this.transformSettings,'pos.x');
        var y = myUtils.propertyAt(this.transformSettings,'pos.y');
        x = x ? x : 0;
        y = y ? y : 0;
        x = initialCoordDest.x ? initialCoordDest.x : x;
        y = initialCoordDest.y ? initialCoordDest.y : y;
        myUtils.propertyAt(this.transformSettings,'pos.x',x);
        myUtils.propertyAt(this.transformSettings,'pos.y',y);
    };

    Actor.prototype.moveToward = function(inputCoordsRef,initialCoordDest){
        var self = this;
        this.primePosCoords(initialCoordDest);

        // var offset = this.getOffset();
        
        var velocitySettings = {
            speed:4,
            degrees:-140
        };

        var myVeloctiy = myUtils.setVelocity(velocitySettings);
        this.el.loopCb(function(){

            velocitySettings.degrees = myUtils.getDegreesFromTwoPoints(inputCoordsRef,self.transformSettings.pos);

            myVeloctiy.update(velocitySettings);
            myVeloctiy.tick(self.transformSettings.pos,inputCoordsRef);
// console.log('zxcv',self.transformSettings.pos.x)
            self.transform({
                // rot: {z:velocitySettings.degrees},
                pos:{
                    x: self.transformSettings.pos.x,
                    y: self.transformSettings.pos.y,
                    applyCenterOffset: true
                }
            },true)
        });

        


          



    
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
                inst[versitileArg].apply(inst,args);
                toReturn = inst;
            } else {
                toReturn = inst[versitileArg]
            }
            
        }
    });
    return toReturn ? toReturn : chain;
};





