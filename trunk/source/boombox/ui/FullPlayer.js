Ext.namespace('Fabs.boombox.ui');
/*
 * Fab's BoomBox Version 1.0
 * Copyright(c) 2009, Owl Watch Consulting Serivces, LLC
 * support@owlwatch.com
 * 
 * MIT License
 */

/**
 * @class Fabs.boombox.ui.FullPlayer
 * @extends Ext.util.Observable
 * A graphic display of the music player
 * @constructor
 * @param {Object} config The config object
 */
Fabs.boombox.ui.FullPlayer = Ext.extend( Ext.util.Observable, {
    
    /**
     * @cfg {Number/String} width
     * The width of the player in pixels, or 'auto' to fill the containing element. Defaults to 'auto'.
     */
    width : 'auto',
    
    /**
     * @cfg {Player} player The player reference for this ui. This is required.
     */
    player : null,
    
    /**
     * @cfg {Number} scrollIncrement The pixel increment that the track label should scroll.
     */
    scrollIncrement : 2,
    
    /**
     * @cfg {Number} scrollHold The number of update intervals to wait before scrolling the opposite direction after the label has reached an end.
     */
    scrollHold : 20,
    
    /**
     * @cfg {Number} opacity The opacity of the player. A number between 0 and 1. Best to keep at 1 for now.
     */
    opacity: 1,
    
    /**
     * @cfg {Number} zIndex The zIndex of the boombox element
     */
    zIndex : 100,
    
    /**
     * @cfg {Number} updateInterval Then time in milliseconds to run the update tasks (label scrolling and position updating)
     */
    updateInterval : 80,
    
    /**
     * @cfg {Number} maxListHeight The maximum size of the playlist
     */
    maxListHeight: 100,
    
    /**
     * @cfg {String} emptyText The text to display in the info bar when no track is playing or active
     */
    emptyText : 'Fab\'s BoomBox!',
    
    /**
     * @cfg {Object} lang The language strings to use for the player. Check the source to see the values that would need to be replaced
     */
    lang : {
        prev            :'Previous Song',
        play            :'Play Song',
        pause           :'Pause Song',
        next            :'Next Song',
        stop            :'Stop Song',
        openPlaylist    :'Open Playlist',
        closePlaylist   :'Close Playlist',
        shuffle         :'Shuffle',
        volume          :'Adjust Volume'
    },
    
    /**
     * @cfg {String} loadingText The text to display when loading track information
     */
    loadingText : 'Loading Track Information...',
    
    /**
     * @cfg {String} trackTpl The string template to display for tracks with song information
     */
    trackTpl : '{playlistIndex}. {title}',
    
    /**
     * @cfg {String} unknownTrackTpl The string template to display for tracks without song information
     */
    unknownTrackTpl : '{playlistIndex}. {filename}',
    
    /**
     * @cfg {Boolean} draggable True to allow this element to be dragged. The element will
     * remain in its initial position in the DOM. Defaults to false.
     */
    draggable : false,
    
    /**
     * @cfg {Boolean} resizeable Allow the player to be resized. The right side will act as the handle.
     * Defaults to false
     */
    resizeable : false,
    
    /**
     * @cfg {Number} minWidth The minimum allowed width for the player. Only applicable if resizeable is enabled.
     */
    minWidth : 200,
    
    /**
     * @cfg {HTMLElement/Element/String} renderTo The element, or id of the element, to render this to upon creation
     */
    
    // private
    labelScrollDirection : -1, // false for right,  true for left
    
    btns : {},
    
    
    constructor : function(config){
        Ext.apply(this, config);
        Fabs.boombox.ui.FullPlayer.superclass.constructor.call(this);
        
        if( !this.tpl ){
            this.tpl = [
                '<div class="bb-ct boombox">',
                    '<div class="bb-player-ct">',
                        '<div class="bb-player-l"></div>',
                        '<div class="bb-player-r"></div>',
                        '<div class="bb-player-c">',
                            '<a href="javascript:;" class="bb-button bb-button-prev" title="',this.lang.prev,'"></a>',
                            '<a href="javascript:;" class="bb-button bb-big-button bb-button-play" title="',this.lang.play,'"></a>',
                            '<a href="javascript:;" class="bb-button bb-button-next" title="',this.lang.next,'"></a>',
                            '<a href="javascript:;" class="bb-button bb-button-stop" title="',this.lang.stop,'"></a>',
                            '<div class="bb-right-buttons">',
                                '<a href="javascript:;" class="bb-button bb-button-playlist" title="',this.lang.openPlaylist,'"></a>',
                                '<a href="javascript:;" class="bb-button bb-button-shuffle" title="',this.lang.shuffle,'"></a>',
                                '<a href="javascript:;" class="bb-button bb-button-volume" title="',this.lang.volume,'"><div class="bb-button bb-button-volume-overlay"></div></a>',
                            '</div>',
                            '<div class="bb-track-ct">',
                                '<div class="bb-track-name-ct">',
                                    '<div class="bb-track-name-scroller">',
                                        '<div class="bb-track-name" unselectable="true" onselectstart="return false;">',this.emptyText,'</div>',
                                    '</div>',
                                '</div>',
                                '<div class="bb-track-progress">',
                                    '<div class="bb-track-progress-overlay"></div>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="bb-playlist-ct">',
                        '<div class="bb-playlist-scroller"></div>',
                    '</div>',
                '</div>'
            ];
        }
        this.tpl = new Ext.Template(this.tpl);
        
        this.trackTpl = new Ext.Template(this.trackTpl);
        this.unknownTrackTpl = new Ext.Template(this.unknownTrackTpl);
        
        if( this.renderTo ){
            Ext.onReady(function(){
                this.render(this.renderTo);
            }, this);
        }
        this.player.on({
            scope               :this,
            statechange         :this.onPlayerStateChange,
            trackchange         :this.onPlayerTrackChange
        });
        
        this.updateTask = {
            run                 :this.update.createDelegate(this),
            interval            :this.updateInterval
        };
        
        this.scrollHoldIndex=0;
    },
    
    /**
     * Render this function to an element. This can be called multiple times so long as it was unrendered first
     * @param {Element/HtmlElement/String} el Element or id of element
     */
    render : function(el){
        
        this.el = Ext.get(el);
        // lets get a reference to the ownerDocument
        this.doc = this.el.dom.ownerDocument;
        this.el.update(this.tpl.applyTemplate({}));
        // now lets get refs to our elements
        this.ct = this.el.child('.bb-ct');
        if( this.pos ){
            this.ct.setXY(this.pos);
        }
        this.ct.setStyle('z-index',this.zIndex);
        
        if( this.resizeable ){
            this.resizeHandle = this.ct.child('.bb-player-r');
            //this.resizeHandle.on('mousedown', this.onResizeHandleMouseDown, this);
            this.ct.addClass('resizeable');
            this.createDragEvent(
                this.resizeHandle,
                this.resizeInit,
                this.resizeMove,
                this
            );
        }
        
        if( this.draggable ){
            this.dragHandle = this.ct.child('.bb-player-l');
            this.ct.addClass('draggable');
            this.createDragEvent(
                this.ct,
                this.dragInit,
                this.dragMove,
                this
            );
        }
        
        this.playerCenter = this.ct.child('.bb-player-c');
        
        // player and buttons
        this.playerCt = this.ct.child('.bb-player-ct');
        this.createButton( this.playerCt, 'prev');
        this.createButton( this.playerCt, 'play');
        this.createButton( this.playerCt, 'next');
        this.createButton( this.playerCt, 'stop');
        this.createButton( this.playerCt, 'playlist');
        // this.btns['playlist'].un('click', this.btnHandlers['playlist']);
        
        // volume (lazy slider...)
        this.volumeBtn = this.playerCt.child('.bb-button-volume');
        this.volumeOverlay = this.volumeBtn.child('.bb-button-volume-overlay');
        this.createDragEvent(
            this.volumeBtn,
            this.onVolumeButtonMouseDown,
            this.onVolumeButtonMouseEvent,
            this
        );
        this.volumeBtn.on('keydown', this.onVolumeKeyDown, this);
        //this.volumeOverlay.on('click', this.onVolumeButtonClick, this);
        
        // shuffle
        this.shuffleBtn = this.playerCt.child('.bb-button-shuffle');
        this.shuffleBtn.on('click', function(){
            this.player.toggleShuffle();
        }, this);
        
        // track container
        this.trackCt = this.playerCt.child('.bb-track-ct');
        this.trackScroller = this.trackCt.child('.bb-track-name-scroller');
        this.trackLabel = this.trackCt.child('.bb-track-name');
        this.createDragEvent(
            this.trackLabel,
            this.onTrackLabelMouseDown,
            this.onTrackLabelMouseMove,
            this,
            function(){ this.trackLabelMouseOrigin=null; }
        );
        
        this.trackProgress = this.trackCt.child('.bb-track-progress');
        this.trackProgressOverlay = this.trackProgress.child('.bb-track-progress-overlay');
        this.createDragEvent(
            this.trackProgress,
            this.onTrackProgressMouseDown,
            this.onTrackProgressMouseEvent,
            this
        );
        
        // playlist container
        this.playlistCt = this.ct.child('.bb-playlist-ct');
        this.playlistCt.setOpacity(0, false);
        this.playlistScroller = this.playlistCt.child('.bb-playlist-scroller');
        this.playlistCt.on('scroll', function(e){ if(e&&e.stopPropogation) e.stopPropogation(); } );
        
        this.onPlayerStateChange();
        this.setWidth(this.width);
        Ext.TaskMgr.start(this.updateTask);
        this.resetTrackScroll.defer(1,this);
        this.updateVolumeOverlay();
        this.ct.setStyle('opacity', this.opacity);
        if( this.player.currentTrack ){
            this.currentTrack = this.player.currentTrack;
            this.updateTrackInfo();
        }
    },
    
    /**
     * Safely unrender the UI and remove all events
     */
    unrender : function(){
        Ext.TaskMgr.stop(this.updateTask);
        Ext.each([this.shuffleBtn, this.playlistCt, this.trackProgress, this.trackLabel, this.volumeBtn], function(o){
            o.removeAllListeners();
            // a little housecleaning to keep our EventManager from getting too big.
            delete Ext.EventManager.elHash[o.dom.id];
        });
        for(var name in this.btns){
            this.btns[name].removeAllListeners();
            // a little housecleaning to keep our EventManager from getting too big.
            delete Ext.EventManager.elHash[this.btns[name].dom.id];
        }
        this.ct.remove();
    },
    
    // private
    resizeInit : function(e){
        this.resizeOrigin = {x: e.getPageX(), width: this.playerCt.getWidth()};
    },
    
    // private
    resizeMove : function(e){
        var w = Math.max( this.resizeOrigin.width+e.getPageX()-this.resizeOrigin.x, this.minWidth );
        this.setWidth(w);
        e.preventDefault();
    },
    
    // private
    dragInit : function(e){
        if( !e.within(this.playerCt.dom)){ return false; }
        this.dragOffset = {x: e.getPageX()-this.ct.getX(), y: e.getPageY()-this.ct.getY() };
        return true;
    },
    
    // private
    dragMove : function(e){
        var pos = [e.getPageX()-this.dragOffset.x, e.getPageY()-this.dragOffset.y];
        if( pos[0] < 0 ){ pos[0] = 0; }
        if( pos[1] < 0 ){ pos[1] = 0; }
        this.pos = pos;
        this.ct.setXY(this.pos);
        e.preventDefault();
    },
    
    /**
     * Dynamically set the width of the player
     * @param {Number/String} width A pixel value or 'auto' to fill the containing element
     */
    setWidth : function(w){
        this.width = w;
        if( this.ct ){
            if( this.width == 'auto' ){
                this.ct.setStyle({'width':'auto'});
            }else{
                this.ct.setStyle('width', this.width+'px');
            }
            this.playlistCt.setStyle( 'width', this.playerCenter.getWidth()+'px' );
        }
    },
    
    
    // private
    createButton : function(parent, name, fn){
        this.btns[name] = parent.child('.bb-button-'+name);
        this.btns[name].on('click', this.onButtonClick.createDelegate(this,[name],0) );
    },
    
    // private
    onButtonClick : function(name,e){
        e.stopPropagation();
        switch(name){
            case 'prev':
            case 'next':
            case 'stop':
                this.player[name]();
                break;
            case 'play':
                this.player.togglePlay();
                break;
            case 'playlist':
                this.togglePlaylist();
                break;
        }
    },
    
    createDragEvent : function(el, onMouseDown, onMouseMove, scope, onMouseUp ){
        var doc = this.doc;
        var E = Ext.EventManager;
        var mouseMove = function(e){
            e.stopPropagation();
            e.preventDefault();
            onMouseMove.apply( scope, arguments );
        };
        var mouseUp = function(e){
            e.preventDefault();
            if( onMouseUp ){
                onMouseUp.apply(scope,arguments);
            }
            E.un(doc,'mousemove', mouseMove, scope );
            E.un(doc,'mouseup', mouseUp, scope );
        };
        var mouseDown = function(e){
            e.stopPropagation();
            e.preventDefault();
            if( onMouseDown.apply(scope, arguments) !== false ){
                E.on(doc,'mousemove', mouseMove, scope );
                E.on(doc,'mouseup', mouseUp, scope );
            }
        };
        el.on('mousedown', mouseDown, scope);
    },
    
    // private
    onVolumeButtonMouseDown : function(e){
        this.onVolumeButtonMouseEvent(e);
    },
    
    // private
    onVolumeButtonMouseEvent : function(e){
        var mx = e.getPageX();
        var vx = this.volumeBtn.getX();
        var w = this.volumeBtn.getWidth();
        var p = Math.max( Math.min((mx-vx)/w * 100, 100), 0 );
        this.player.setVolume(p);
        this.updateVolumeOverlay(p);
        e.preventDefault();
    },
    
    // private
    onTrackProgressMouseDown : function(e){
        this.onTrackProgressMouseEvent(e);
    },
    
    // private
    onTrackProgressMouseEvent : function(e){
        var mx = e.getPageX();
        var tx = this.trackProgress.getX();
        var w = this.trackProgress.getWidth();
        var p = Math.max( Math.min((mx-tx)/w * 100, 100), 0 );
        this.player.seek(p);
        e.preventDefault();
    },
    
    // private
    onVolumeKeyDown : function(e){
        var v = this.player.volume;
        if( e.getKey() == 38 ){
            v = Math.min(v+5,100);
        }
        else if( e.getKey() == 40 ){
            v = Math.max(v-5,0);
        }
        this.player.setVolume(v);
        this.updateVolumeOverlay(v);
    },
    
    // private
    onTrackLabelMouseDown : function(e){
        this.trackLabelMouseOrigin = {x: e.getPageX(), scrollLeft: this.trackScroller.getScroll().left};
    },
    
     // private
    onTrackLabelMouseMove : function(e){
        var d = this.trackLabelMouseOrigin.x - e.getPageX();
        var lw = this.trackLabel.getWidth();
        var lc = this.trackScroller.getWidth(true);
        if( lw > lc ){
            var o = lw - lc;
            var left = this.trackLabelMouseOrigin.scrollLeft;
            this.trackScroller.scrollTo('left', Math.max( Math.min(o, d+left), 0) );
        }
        e.preventDefault();
    },
    
    // private
    onPlayerStateChange : function(){
        this.playerCt[this.player.isPlaying()?'addClass':'removeClass']('bb-playing');
        this.playerCt[this.player.shuffle?'addClass':'removeClass']('shuffle');
        this.btns.play.dom.title = this.lang[ this.player.isPlaying() ? 'pause' : 'play' ];
    },
    
    // private
    onPlayerTrackChange : function(player, track){
        if( this.currentTrack && this.currentTrack == track ){
            return;
        }
        if( this.currentTrack && this.currentTrack != track ){
            track.un('infochange', this.updateTrackInfo, this);
        }
        this.currentTrack = track;
        if( track.hasSongInfo('title') ){
            this.updateTrackInfo();
        }
        else{
            this.resetTrackScroll();
            if( this.trackLabel ){
                this.trackLabel.update(this.loadingText);
            }
        }
        track.on('infochange', this.updateTrackInfo, this );
        // track.on('positionchange', this.updateTrackPosition, this);
    },
    
    // private
    resetTrackScroll : function(){
        if( this.trackScroller ){
            this.trackScroller.scrollTo('left',0);
        }
        this.labelScrollDirection=-1;
        this.scrollHoldIndex=0;
    },
    
    // private
    updateTrackInfo : function(){
        this.resetTrackScroll();
        this.trackLabel.update((this.player.getPlaylist().tracks.indexOf(this.currentTrack)+1)+'. '+this.currentTrack.title);
    },
    
    // private
    updateTrackPosition : function(){
        if( !this.currentTrack ){
            return;
        }
        try{
            this.trackProgressOverlay.setStyle( 'width', this.currentTrack.getProgressPercent()+'%');
        }
        catch(e){
            // something weird with IE
        }
    },
    
    // private
    updateVolumeOverlay : function(p){
        this.volumeOverlay.setWidth(parseInt((p||this.player.volume), 10)+'%');
    },
    
    // private
    updateTrackLabelPosition : function(){
        if( this.trackLabelMouseOrigin ){
            return;
        }
        var lw = this.trackLabel.getWidth();
        var lc = this.trackScroller.getWidth(true);
        if( lw > lc ){
            var o = lw - lc;
            var left = parseInt(this.trackScroller.getScroll().left,10);
            if( left <= 0 || left >= o){
                if( this.scrollHoldIndex < this.scrollHold ){
                    this.scrollHoldIndex++;
                    return;
                }
                else{
                    this.scrollHoldIndex=0;
                }
                this.labelScrollDirection *= -1;
            }
            var d = this.scrollIncrement * this.labelScrollDirection;
            this.trackScroller.scrollTo('left',left+d);
        }
        else{
            this.trackScroller.scrollTo('left',0);
        }
        
    },
    
    // private
    update : function(){
        this.updateTrackPosition();
        this.updateTrackLabelPosition();
    },
    
    // private
    playlistClickTest : function(e){
        if( !e.within( this.ct.dom ) ){
            this.togglePlaylist();
        }
    },
    
    /**
     * Toggle the playlist visibility
     */
    togglePlaylist : function(){
        var E = Ext.EventManager;
        if( this.playlistCt.getHeight() > 0 || this.playlistCt.getStyle('opacity') > 0){
            this.btns.playlist.dom.title = this.lang.openPlaylist;
            this.ct.removeClass('playlist-open');
            E.un(this.doc,'click', this.playlistClickTest, this);
            this.playlistCt.un('click', this.onPlaylistCtClick, this);
            this.playlistCt.setHeight(0, true);
            this.playlistCt.setOpacity(0, true);
            return false;
        }
        this.btns.playlist.dom.title = this.lang.closePlaylist;
        this.ct.addClass('playlist-open');
        E.on(this.doc,'click', this.playlistClickTest, this);
        this.playlistCt.setWidth( this.playerCenter.getWidth() );
       
        // lets neatly remove all old elements if they exist...
        if( this.trackMap ){
            for( var i in this.trackMap ){
                /*
                Weird... if i use Ext.fly(i).remove();
                I get some strange behavior regarding clicks and mousedown events
                */
                var el = this.doc.getElementById(i);
                if( el ){
                    el.parentNode.removeChild(el);
                }
            }
        }
        
        this.trackMap = {};
        
        // we don't use this yet, but would be cool to update tracks
        // when there is an info change (id3 events)
        this.trackMapR = {};
        this.playlistScroller.update('');
        
        // this just ensures that the playlist is empty.
        this.player.getPlaylist().tracks.each( function(track, key, index){
            track.playlistIndex = index+1;
            try{
                track.filename = /\/([^\/]*)$/.exec( decodeURIComponent( track.url))[1].replace(/\.mp3$/, '');
            }catch(e){
                track.filename = track.url;
            }
            var el = this.playlistScroller.createChild({
                tag             :'a',
                href            :'javascript:;',
                cls             :'bb-track',
                html            :this[track.hasSongInfo('title')?'trackTpl':'unknownTrackTpl'].apply(track)
            });
            this.trackMap[el.dom.id] = track;
            this.trackMapR[track.id] = el;
        }, this);
       
        var h = this.playlistScroller.getHeight(true);
        this.playlistCt.setHeight( this.maxListHeight ? Math.min( this.maxListHeight,h) : h, true );
        this.playlistCt.setOpacity(0);
        this.playlistCt.setOpacity(1, true);
        this.playlistCt.on('click', this.onPlaylistCtClick, this);
        return false;
    },
    
    onPlaylistCtClick : function(e){
        var t = e.getTarget();
        this.player.play(this.trackMap[t.id]);
    }
    
    
});