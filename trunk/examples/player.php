<?php
$config = require_once(dirname(__FILE__).'/config.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-gb" lang="en-gb" >
    <head>
		<title>Fab's Boombox Basic Page</title>
		<link rel="stylesheet" type="text/css" href="../resources/css/boombox.css" />
        <script type="text/javascript" src="../resources/js/ext-core.js"></script>
        <script type="text/javascript" src="../resources/js/soundmanager2-nodebug-jsmin.js"></script>
		<!-- include boombox files -->
		<?php
		if( $config['debug'] ){
			?>
        <script type="text/javascript" src="../source/boombox/Base.js"></script>
		<script type="text/javascript" src="../source/util/Hash.js"></script>
		<script type="text/javascript" src="../source/boombox/Track.js"></script>
		<script type="text/javascript" src="../source/boombox/Playlist.js"></script>
		<script type="text/javascript" src="../source/boombox/Player.js"></script>
		<script type="text/javascript" src="../source/boombox/ui/FullPlayer.js"></script>
			<?php
		}
		else{
			?>
		<script type="text/javascript" src="../package/boombox.js"></script>
			<?php
		}
		?>
        <script type="text/javascript">
            // implement the music player here.
			soundManager.url = '../resources/swf/';
            var p = new Fabs.boombox.Player({
				autoPlay: true,
				shuffle:false,
				volume:40,
				shuffle:true
			});
			
			var tracks = [
				{
					url: 'http://owlwatch.net/music/fabrizio-olsen-joyce-and-wheeler/fab 4 - In Walked Bud.mp3',
					title: 'Fabrizio, Olsen, Joyce and Wheeler - In Walked Bud'
				},
				{
					url: 'http://owlwatch.net/music/fabrizio-olsen-joyce-and-wheeler/fab 4 - Billie\'s Bounce.mp3',
					title: 'Fabrizio, Olsen, Joyce and Wheeler - Billie\'s Bounce'
				},
				{
					url: 'http://owlwatch.net/music/fabrizio-joyce/Fabrizio - Joyce Duo - Autumn Leaves.mp3',
					title: 'Fabrizio and Joyce - Autumn Leaves'
				}
			];
			p.getPlaylist().addTracks(tracks);
			
			
			window.ui = new Fabs.boombox.ui.FullPlayer({
				player: p,
				renderTo: 'boombox',
				width: 300,
				maxListHeight: 150,
				draggable: true,
				resizeable: true
			});
        </script>
        <style type="text/css">
            body{
                font-family: "Trebuchet MS";
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <h1>Fab's BoomBox + Explicitly Added Tracks</h1>
        <div id="boombox"></div>
    </body>
</html>