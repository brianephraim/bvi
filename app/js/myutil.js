
$.fn.actor = function(toGet) {
    var Actor = function(el){
        this.el = el;
        this.refresh();
    };
    Actor.prototype.refresh = function(){
        this.getSize();
        this.getCenter();
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
            x: this.height/2,
            y: this.width/2
        };
        this.centerX = this.centerX;
        this.centerY = this.centerY;
    };
    var toReturn;
    var chain = this.each(function() {
        var el = $(this);
        var inst = el.data('actor');
        if(!inst) {
            el.data('actor', new Actor(el));
        } else {
            if(!toGet){
                console.log('vvv',inst)
                toReturn = inst;
            } else if(typeof inst[toGet] === 'function'){
                inst[toGet]();
                toReturn = inst;
            } else {
                toReturn = inst[toGet]
            }
            
        }
    });
    return toReturn ? toReturn : chain;
};




;(function(){

    var drawFrame = function(context) {
        if(context.cbsCount > 0){
            context.running = true;
            window.requestAnimationFrame(function(){drawFrame(context)});
            context.doCbs(context);
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
        console.log('cccc',id)
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
        drawFrame(this);

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