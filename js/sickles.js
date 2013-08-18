function debounce(func, threshold, execAsap) {

    var timeout;

    return function debounced() {
        var obj = this, args = arguments;
        function delayed() {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        };

        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);

        timeout = setTimeout(delayed, threshold || 100);
    };

};


(function SickleS() {
    //cache obj
    var cssObj = function (e,mxw,mw,mwunt,mxunt) {
        this.elemCol = e;
        this.max_width = mxw;
        this.min_width = mw;
        this.min_unit = mwunt;
        this.max_unit = mxunt;
        this.nested_level=0;
    }

    //getting css content
    var cssCol=[];    
    var result;
    for (i = 0; i < document.styleSheets.length; i++) {
        var temp = document.styleSheets[i];
        if (temp.ownerNode.getAttribute("data-sickles")=="sickles") {
            var cssSource = temp.rules || temp.cssRules;              

            for (j = 0; j < cssSource.length; j++) {
                var selectors = cssSource[j].selectorText;                    
                if (!selectors) continue;
                selectors = selectors.split(",");

                for (k = 0; k < selectors.length; k++) {
                    var regex = /(\[(min\-width|max\-width)\~\=(\'|\")([0-9]*.?[0-9]+)(px|em)(\'|\")\])(\[(min\-width|max\-width)\~\=(\'|\")([0-9]*.?[0-9]+)(px|em)(\'|\")\])?/gi;
                    result = regex.exec(selectors[k]);                    
                    if (result) {

                        //this complex is due to IE sucker
                        var tempSelector = selectors[k].slice(0, result.index) + selectors[k].slice(result.index + result[0].length)
                        var tailselect = tempSelector.substring(result.index)
                        var headselect = tempSelector.substring(0,result.index)
                        tailselect = tailselect.substr(0, tailselect.indexOf(' '));
                        tempSelector = headselect + tailselect;

                        var tempArray = $(tempSelector).toArray();
                        for (l = 0; l < tempArray.length; l++) {

                            var elemCss = new cssObj();

                            elemCss.elemCol = $(tempArray[l]);
                            elemCss.elemCol.attr("sickle", "s");
                            if (result[2] == "max-width") {
                                elemCss.max_width = result[4];
                                elemCss.max_unit = result[5];
                            } else {
                                elemCss.min_width = result[4];
                                elemCss.min_unit = result[5];
                            };

                            if (result[8]) {
                                if (result[8] == "max-width") {
                                    elemCss.max_width = result[10];
                                    elemCss.max_unit = result[11];
                                } else {
                                    elemCss.min_width = result[10];
                                    elemCss.min_unit = result[11];
                                };
                            };
                            cssCol.push(elemCss);
                        }                                             
                    };
                };                
            };            
        };
    };
    //structuring sickling-based on its nested level
    function NestedLevel(element, nst) {
        this.nested = nst;
        this.p = element.parents("[sickle]");        
        if (this.p.length) {
            nested++;
            NestedLevel(this.p, this.nested);
        }
        return this.nested
    }
    for (i = 0; i < cssCol.length; i++) {
        cssCol[i].nested_level = NestedLevel(cssCol[i].elemCol, 0);
    }
    cssCol.sort(function (a, b) {
        a.elemCol.removeAttr("sickle");
        b.elemCol.removeAttr("sickle");
        return a.nested_level - b.nested_level
    })

    var ua = navigator.userAgent.toLowerCase();
    var isSafari;
    if (ua.indexOf('safari') != -1) {
        if (ua.indexOf('chrome') <= -1) {
            isSafari = true;
        } 
    }
    var trigger = false;
    //core manupilation 
    function Sickling() {
        trigger = false;
        for (i = 0; i < cssCol.length; i++) {
            var isChanged = true;
            var rmin_unit = 1;
            var rmax_unit = 1;
            var $obj = cssCol[i].elemCol;
            var obj = cssCol[i].elemCol[0];           

            var emratio = getComputedStyle(obj, "").fontSize;
            emratio = emratio.substring(0, emratio.length - 2);
            
            if (cssCol[i].min_unit == "em") rmin_unit = emratio;
            if (cssCol[i].max_unit == "em") rmax_unit = emratio;

            var minflag = false;
            var maxflag = false;
            if (cssCol[i].min_width) minflag = true;
            if (cssCol[i].max_width) maxflag = true;

                var min_width = cssCol[i].min_width * rmin_unit;
                var max_width = cssCol[i].max_width * rmax_unit;

                var curr_min_width = $obj.attr("min-width")||" ";
                var curr_max_width = $obj.attr("max-width")||" ";
                var add_min_width = cssCol[i].min_width + cssCol[i].min_unit;
                var add_max_width = cssCol[i].max_width + cssCol[i].max_unit;

                var new_min_width=" ";
                var new_max_width=" ";
                
                var box = obj.getBoundingClientRect();
                var w = box.width || (box.right - box.left);

                if (minflag) {                                     
                    if (w > min_width) {
                        if (curr_min_width.indexOf(add_min_width) == -1)
                            if (curr_min_width == "") new_min_width = add_min_width;
                            else new_min_width = curr_min_width + " " + add_min_width;
                        else {
                            new_min_width = curr_min_width;
                            isChanged=false;
                        }
                    } else {                        
                        new_min_width = curr_min_width.replace(new RegExp(add_min_width, 'g'), "");
                        if (new_min_width == curr_min_width) isChanged = false;
                    }
                    if (isChanged) {
                        obj.setAttribute("min-width", new_min_width.replace(/  +/g, ' '))
                        trigger = true;
                    }                    
                }
                isChanged = true;
                if (maxflag) {                    
                    if (w < max_width) {
                        if (curr_max_width.indexOf(add_max_width) == -1)
                            if (curr_max_width == "") new_max_width = add_max_width;
                            else new_max_width = curr_max_width + " " + add_max_width;
                        else {
                            new_max_width = curr_max_width;   
                            isChanged = false;
                        }
                    }
                    else {
                        new_max_width = curr_max_width.replace(new RegExp(add_max_width, 'g'), "");
                        if (new_max_width == curr_max_width) isChanged = false;                        
                    }                    
                    if (isChanged) {
                        obj.setAttribute("max-width", new_max_width.replace(/  +/g, ' '))
                        trigger = true;                        
                    }                    
                }               
        }
        //for safari 
        if (isSafari) {
            document.body.setAttribute("class", "reflow");
            document.body.removeAttribute("class", "reflow");
            if (trigger) {
                Sickling();
            }
        }
    };  
    var foo = $('.footable');
    $(window).on("DOMContentLoaded",function () {
        Sickling();
        if (foo.footable) {
            if (foo.hasClass('table-zebra') || foo.hasClass('table-zebra-both')) foo.footable().find('> tbody > tr:not(.footable-row-detail):nth-child(odd)').addClass('zebra');
            else foo.footable();
        }
    })
    $(window).resize(debounce(Sickling, 100, false))

}());    


//Plugin-------------------------------------------------------------------------------------

// slidershow
(function ($) {
    var MySlider = function (element, options) {

        var $element = $(element);
        var obj = this;

        var active = $(".slide-nav li", element).index($('.slide-nav .active', element));
        if (active == -1) active = 0;
        var isPlay = true;
        var length = $('.slide-content', element).eq(0).find('.slide-item').length;
        var slideId;
        this.speed = options.slidespeed;
        this.inteval = options.slideInteval;

        this.slideTo = function (index) {
            active = index;
            if (active < 0) active = length - 1;
            if (active >= length) active = 0;
            $(".slide-nav li", element).eq(active).addClass("active").siblings().removeClass("active");
            $(".slide-content", element).animate({ "left": -active * 100 + "%" }, obj.speed, "swing");
            return this;
        };
        this.slideNext = function () {
            obj.slideTo(active + 1);
            return this;
        };
        this.slidePrev = function () {
            obj.slideTo(active - 1);
            return this;
        };
        this.slide = function () {
            slideId = setInterval(obj.slideNext, obj.inteval);
            return this;
        };
        this.slideStop = function () {
            clearInterval(slideId);
            return this;
        };

    };
    $.fn.slidershow = function (options) {
        //override default
        var opts = $.extend({}, $.fn.slidershow.defaults, options);
        // Our plugin implementation code goes here.

        return this.each(function () {
            var element = $(this);
            if (element.data('slidershow')) return;
            var myslider = new MySlider(this, opts);
            element.data('slidershow', myslider);
            myslider.slide();
            $(".slide-nav li", this).click(function (e) {
                e.preventDefault();
                var target = $(this).attr("data-index");
                myslider.slideTo(target);
                e.stopPropagation();
            });
        });
    };
    // Plugin defaults added as a property on our plugin function.
    $.fn.slidershow.defaults = {
        slidespeed: 500,
        slideInteval: 4000
    };
})(jQuery);

//Component-----------------------------------------------------------------------------------
$(document).ready(function () {
    $(".collapse [data-target]").click(function (e) {
        e.preventDefault();
        var temp = $(this).attr("data-target");
        var x = $(temp, $(this).parents());
        if (!x.hasClass("show")) x.addClass("show").hide().slideDown("medium").css('display', '');
        else x.slideUp("medium", function () {
            x.removeClass("show").css('display', '');
        });
    });
    $(".dropdown [data-target]").click(function (e) {
        e.preventDefault();
        var temp = $(this).attr("data-target");
        var x = $(temp, $(this).parent());
        $(temp).not(x).removeClass('open');
        x.toggleClass("open");
        e.stopPropagation();
    });

    $(".tabs [data-index]").click(function (e) {
        var $this = $(this);
        var active = $this.attr("data-index");
        var element = $this.parents(".tabs");
        $this.addClass("tab-active").siblings().removeClass("tab-active");
        $(".tabs-item", element).eq(active).addClass("tab-active").siblings().removeClass("tab-active");
    });

    $('.slidershow').slidershow();

    $('body').click(function (e) {
        var container = $(".dropdown");
        var temp = $("[data-target]", container).attr("data-target");
        // if (!container.is(e.target) && container.has(e.target).length === 0) // ... nor a descendant of the container
        container.children(temp).removeClass("open");
    });
});