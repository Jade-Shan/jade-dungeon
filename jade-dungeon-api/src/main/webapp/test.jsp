<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%> 
<%@ page isELIgnored="false" %>  
<!DOCTYPE html>
<html lang="en">
<head>
<script src="//cdn.bootcss.com/jquery/2.1.4/jquery.min.js"></script>
<meta charset="UTF-8">
<title>test page</title>
</head>
<body>

<br/> <br/> <br/> <br/> 

<form action="<c:url value="/api/blog/recordJournal" />" method="post">
	<input type="text" name="auth" value="Jade Shan"/><br/>
	<input type="text" name="title" value=""/><br/>
	<textarea name="text" rows="10" cols="30"></textarea><br/>
	<input type="submit" value="Submit">
</form>

<br/> <br/> <br/> <br/> 

<form action="<c:url value="/api/blog/recordGallery" />" method="post">
	<input type="text" name="auth" value="Jade Shan"/><br/>
	<input type="text" name="title" value=""/><br/>
	<textarea name="text" rows="10" cols="30"></textarea><br/>

	<div id="pics"></div>

	<input type="submit" value="Submit">
</form>

<div id="newLine">
	id: <input type="text" id="nid" value="1"/>
	title: <input type="text" id="ntit" value=""/>
	desc: <input type="text" id="ndsc" value=""/>
	rul: <input type="text" id="nul" value=""/>
</div>
<input type="button" value="add" onClick="addImage();" />

</body>
<script>
function addImage() {
	var id = $("#nid").val();
	var title = $("#ntit").val();
	var desc = $("#ndsc").val();
	var url = $("#nul").val();

	var html = '<div id="pic-' + id + '">' +
		'<input type="text" name="id" value="' + id + '"/>' +
		'<input type="text" name="tit" value="' + title + '"/>' +
		'<input type="text" name="dsc" value="' + desc + '"/>' +
		'<input type="text" name="ul" value="' + url + '"/>' +
		'<input type="button" value="remove" recid="pic-' + id + '" onClick="removeImage(this);" />' +
		'</div>';

	var block = $("#pics").append($(html));
	$("#nid").val(id + 1);
};

function removeImage(btn) {
	$('#' + $(btn).attr("recid")).remove();
};
</script>
</html>
