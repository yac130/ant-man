
$.fn.orbit=function(){return this.each(function(){
var $element = $(this);
 if ($element.length<1) return;
        var $arrows = $element.find('.ui-arrows'),
            $pager = $element.find('.ui-pager'),
            $indicator = $element.find('.ui-indicator').hide(),
            $inner = $element.find('.ui-inner'),
            $items = $inner.children('.ui-item'),
            $ytb = $element.find('embed'),
            itemsLength = $items.length, captiontExternal,
            sizes,
            currentSize,
            page = 0,
            innerWidthIni, 
            itemMarginIni, 
            itemXPageIni,
            pages,
            interval = ($element.data('interval')||0)*1, 
            timer,
            bullet = $element.data("bullet" ) ? true : false;
            
        sizes = $element.data('size')?$element.data('size').replace(/:([\w\.]*)/g,':[$1]').replace(/x/g,','):'3020:[1,100,0]';
        sizes = eval('[{'+sizes+'}]')[0];

        $element.on('move',function(event, param){
            page = param.page;
            slide();
        });
            
        function slide(){
            var move = (page*100);
            var dif = (move+100 - innerWidthIni);
            if (dif>0) move -= dif + (itemMarginIni/itemXPageIni);
            move += (itemMarginIni * page);
            $element.siblings('ui-orbit-caption').fadeOut('quint');
            $inner.stop().animate({'margin-left':(move*-1) + '%' },'quint',function(){
                if (captiontExternal) console.log('show caption'),$element.siblings('.ui-orbit-caption').html($('<p>',{html:$items.eq(page).find('figcaption').html()}));
            
            });
            
            $items.removeClass("ui-visible");
            $($items[page]).addClass("ui-visible");
            if ($pager.children().length>0) $pager.children('li').removeClass('ui-active').eq(page).addClass('ui-active');
            if ($indicator.length) $indicator.html('<span>'+(page+1)+'</span> / '+pages);
            $element.trigger('slide',{page:page});
            pause_yt();
        }
        
        var rounder = function(number,decimal){
        decimal = parseFloat(decimal?decimal:2)+1;
        decimal = parseFloat('10000'.substr(0,decimal));
        return Math.round(number*decimal)/decimal
        }

        function render(){
            var itemWidthIni, itemMargin, itemWidth, html = '', _pages, dif, size = sizes[currentSize];
            
            itemXPageIni = size[0];
            itemWidthIni = size[1];
            itemMarginIni = size[2];
            
            innerWidthIni = (itemWidthIni+itemMarginIni)*itemsLength;
            captiontExternal = $element.siblings('.ui-orbit-caption').length>0&&itemXPageIni==1&&$items.find('figcaption').hide(); 
            
            _pages = Math.ceil(pages =(innerWidthIni/100));
            $items.removeAttr('style'), 
            $inner.removeAttr('style');
            $inner.css({'width': (innerWidthIni+(itemMarginIni*pages)) +'%', 'height': 'auto'});
            itemMargin = rounder (((itemMarginIni*100)/itemWidthIni) / itemsLength);
            itemWidth = (100/itemsLength)  - itemMargin;
            
            $items.css({
                'width': itemWidth + '%',
                'margin-right': (itemMarginIni?rounder(itemMargin):0)+'%'
            });

            $($items[page]).addClass("ui-visible");
            
            dif = 100-((itemMargin+itemWidth)*itemsLength);
            if (dif!=0){
                if (itemMargin) $items.filter(':last').css('margin-right', (itemMargin+dif)+'%');
                else $items.eq(0).css({'width': (itemWidth+( 100-(itemWidth*itemsLength) )) + '%' });
            }

            //pager
            page = (page>_pages)?_pages-1:page;
            if (_pages>1){
                
                $pager.html(1 + ' de ' + _pages);
                if(bullet){
                    for(var i=1; i <= _pages; i++){ html  += '<li>'+(i)+'</li>' }
                    $pager.html(html).children('li').on('click',function(e){
                        e.preventDefault();
                        var _t = $(this);
                        
                        if (_t.hasClass('ui-active')) return;
                        page = _t.prevAll().length;
                        
                        slide();
                        _t.addClass('ui-active').siblings().removeClass('ui-active');
                    }).eq(page).trigger('click');
                }
                $pager.show()
            }else{
                $arrows.hide();
                $pager.hide()
            }
            if ($indicator.length && _pages){
                $indicator.show().html('<span>1</span> / '+_pages);
            }
        }
        function resize(){
            var winWidth = $(window,document).width(), widthOld = 0;
            for(var size in sizes){
                if (winWidth>widthOld && winWidth<=size){
                    if (size != currentSize) {
                        currentSize = size;
                        render(sizes[size]);
                    }
                    return;
                }
                widthOld = size;
            }           
        }
        
        function cycle(){
            if (interval>0){
                timer = setInterval(function(){
                    $('.ui-next',$arrows).trigger('click');
                },interval)
            }           
        }

        function pause_yt(){
            if($ytb.length > 0){
                $.each( $ytb, function() {
                    try {
                        if(this.getPlayerState() == 1) this.pauseVideo(); 
                    } catch(err){ return false; }
                });
            }
        }
        
        $('.ui-prev, .ui-next',$arrows).on('click.libui',function(e){
            e.preventDefault();
            var _pages = Math.ceil(pages);
            page +=($(this).hasClass('ui-prev')?(-1):(1));
            page = (page<0?(_pages-1):(page>=_pages?0:page));
            slide();
            if(!bullet){$pager.html( (page+1) + ' de ' + _pages);}
        });
        
        if (($element.data('resize')||'auto')=='auto'){ $(window).on('resize.libui', resize)};
        
        $element.on('mouseenter',function(){
            clearInterval(timer);
        }).on('mouseleave',function(){
            cycle();
        });
        resize();
        cycle();  


    })}