<?xml version="1.0" encoding="utf-8"?>
<project path="" name="Fab's BoomBox" author="Mark Fabrizio Jr." version="1.0 Alpha" copyright="$projectName&#xD;&#xA;Copyright(c) 2006, $author.&#xD;&#xA;&#xD;&#xA;This code is licensed under BSD license. Use it as you wish, &#xD;&#xA;but keep this copyright intact." output="$project\..\..\dist" source="True" source-dir="$output\source" minify="true" min-dir="$output\build" doc="true" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="" />
  <file name="boombox\Base.js" path="boombox" />
  <file name="boombox\Player.js" path="boombox" />
  <file name="boombox\Playlist.js" path="boombox" />
  <file name="boombox\Track.js" path="boombox" />
  <file name="util\Hash.js" path="util" />
  <target name="BoomBox" file="$output\boombox.js" debug="True" shorthand="False" shorthand-list="YAHOO.util.Dom.setStyle&#xD;&#xA;YAHOO.util.Dom.getStyle&#xD;&#xA;YAHOO.util.Dom.getRegion&#xD;&#xA;YAHOO.util.Dom.getViewportHeight&#xD;&#xA;YAHOO.util.Dom.getViewportWidth&#xD;&#xA;YAHOO.util.Dom.get&#xD;&#xA;YAHOO.util.Dom.getXY&#xD;&#xA;YAHOO.util.Dom.setXY&#xD;&#xA;YAHOO.util.CustomEvent&#xD;&#xA;YAHOO.util.Event.addListener&#xD;&#xA;YAHOO.util.Event.getEvent&#xD;&#xA;YAHOO.util.Event.getTarget&#xD;&#xA;YAHOO.util.Event.preventDefault&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Event.stopPropagation&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Anim&#xD;&#xA;YAHOO.util.Motion&#xD;&#xA;YAHOO.util.Connect.asyncRequest&#xD;&#xA;YAHOO.util.Connect.setForm&#xD;&#xA;YAHOO.util.Dom&#xD;&#xA;YAHOO.util.Event">
    <include name="boombox\Base.js" />
    <include name="util\Hash.js" />
    <include name="boombox\Track.js" />
    <include name="boombox\Playlist.js" />
    <include name="boombox\Player.js" />
    <include name="boombox\playlist\Xspf.js" />
    <include name="boombox\playlist\Podcast.js" />
    <include name="boombox\ui\FullPlayer.js" />
    <include name="boombox\ui\SimpleButton.js" />
  </target>
  <file name="boombox\ui\FullPlayer.js" path="boombox\ui" />
  <file name="boombox\ui\SimpleButton.js" path="boombox\ui" />
  <file name="boombox\playlist\Podcast.js" path="boombox\playlist" />
  <file name="boombox\playlist\Xspf.js" path="boombox\playlist" />
</project>