var net = net || {};
(function ($) {
	net.jadedungeon = function () { init(); return this; };
	var self = net.jadedungeon.prototype;
	var init = function (cfg) {
		self.ui = {};
		self.data = {};
		self.cfg = {ajaxTimeout: 5000};

		self.markdown = new showdown.Converter();

		self.data.nav = [ {title: "Journal", link: "/"},
			{title: "Gallery", link: "/gallery.html"},
			{title: "Note", link: "/notes/wiki_html", isNewWin: true},
			{title: "About Me", subs: [
				{title: "Github", link: "https://github.com/Jade-Shan/", isNewWin: true},
				{title: "", link: ""},
				{title: "Resume", link: "/resume.html"}]
		}];
	};

	self.renderTopNav = function (page) {
		var addLink = function (item, page) {
			if (item.title === "") {
				navhtml = navhtml + '<li class="divider"></li>';
			} else {
				if (page && page.pageTitle === item.title) {
					navhtml = navhtml + '<li class="active">';
				} else { navhtml = navhtml + '<li>'; }
				if (item.isNewWin) {
					navhtml = navhtml + '<a target="_blank" href="' + item.link + '">';
				} else { navhtml = navhtml + '<a href="' + item.link + '">'; }
				navhtml = navhtml + item.title + '</a></li>';
			}
		};

		var addSub = function (item) {
			navhtml = navhtml + '<li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">';
			navhtml = navhtml + item.title;
			navhtml = navhtml + '<b class="caret"></b></a><ul class="dropdown-menu">';
			$.each(item.subs, function (i, item) { addLink(item, false); });
			navhtml = navhtml + '</ul></li>';
		};

		var navhtml = '<div class="navbar-header"> <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#example-navbar-collapse"> <span class="sr-only">切换导航</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button> <a class="navbar-brand" href="/">Jade Dungeon</a> </div> <div class="collapse navbar-collapse" id="example-navbar-collapse"> <ul class="nav navbar-nav">';
		$.each(self.data.nav, function (i, item) {
				if (item.link) { addLink(item, page); }
				else if (item.subs) { addSub(item); }
		});
		navhtml = navhtml + '</ul></div>';
		$("#topnav").html(navhtml);
	};

	self.renderSubTitle = function (page) { $("#subTitle").html(page.subTitle); };

	self.renderPagination = function (page, count, callbackName) {
		var i = 1;
		var html = '<ul class="pagination center">';
		if (page === 1) {
			html = html + '<li><a class="disable" href="javascript:void(0);">&laquo;</a></li>';
		} else {
			html = html + '<li><a href="javascript:' + callbackName + 
				'(' + i + ');">&laquo;</a></li>';
		}
		while (page > i) {
			html = html + '<li><a href="javascript:' + callbackName + 
				'(' + i + ');">' + i + '</a></li>';
			i = i + 1;
		}
		html = html + '<li class="active"><a href="javascript:void(0);">' + page + 
			'</a></li>';
		i = page + 1;
		while (i <= count) {
			html = html + '<li><a href="javascript:' + callbackName + 
				'(' + i + ');">' + i + '</a></li>';
			i = i + 1;
		}
		if (page === count) {
			html = html + '<li><a class="disable" href="javascript:void(0);">&raquo;</a></li>';
		} else {
			html = html + '<li><a href="javascript:' + callbackName + 
				'(' + count + ');">&raquo;</a></li>';
		}
		html = html + '</ul>';
		return html;
	};

	self.renderPhotoFrame = function () {
		var html = '<div class="modal-dialog"><div class="modal-content">';
		html = html + '<div class="modal-header">';
		html = html + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
		html = html + '<h4 class="modal-title" id="photo-frame-label"></h4></div>';
		html = html + '<div class="modal-body row">';
		html = html + '<img id="photo-frame-img" alt="" src="" class="col-xs-12 col-sm-12 col-md-12 col-lg-12" >';
		html = html + '</div></div>';
		$("#photo-frame").html(html);
	};

	self.renderPicItem = function (itm) {
		var html = '<div class="col-sm-6 col-md-3"><div class="thumbnail">';
		html = html + '<img onClick="javascript:net.jadedungeon.viewPic(this)" id="' + itm.id + '" src="' + itm.url +'" alt="' + 
			itm.title +'"></div>';
		html = html + '<div class="caption"><h3>' + itm.title + '</h3><p>' + 
			itm.desc + '</p></div></div>';
		return html;
	};

	self.renderArticle = function (itm) {
		var html = '<div class="item">';
		html = html + '<div class="title">' + itm.title + '</div>';
		var t = (new Date());
		t.setTime(itm.time);
		html = html + '<div class="metadata">' + t.toLocaleString() +
			' by ' + itm.auth + '</div>';
		html = html + '<div class="body">' + 
			net.jadedungeon.markdown.makeHtml(itm.text) + '</div>';
		html = html + '</div>';
		if (itm.ablum && itm.ablum.length > 0) {
			html = html + '<div class="row">';
			$.each(itm.ablum, function (i, pic) {
				html = html + self.renderPicItem(pic);
			});
			html = html + '</div>';
		}
		html = html + '<div class="divider"><span></span></div>';
		return html;
	};

	self.viewPic = function (img) {
		var m = $(img);
		$("#photo-frame-label").html(m.attr("alt"));
		$("#photo-frame-img").attr("src", m.attr("src"));
		$("#photo-frame-img").attr("alt", m.attr("alt"));
		$('#photo-frame').modal('show');
	};

})(jQuery);

(function ($) {
	net.jadedungeon.gallery = function (cfg) { init(cfg); return this; };
	var self = net.jadedungeon.gallery.prototype;
	var init = function (cfg) {
		net.jadedungeon = new net.jadedungeon();
		self.initCfg = cfg;
	};

	self.render = function () {
		net.jadedungeon.renderTopNav(self.initCfg);
		net.jadedungeon.renderSubTitle(self.initCfg);
		net.jadedungeon.renderPhotoFrame();
	};

	self.renderGallery = function (data) {
		var html = '<div class="spacer"></div>';
		$.each(data.articles, function (i, itm) {
			html = html + net.jadedungeon.renderArticle(itm);
		});
		html = html + net.jadedungeon.renderPagination(data.page, data.count, "page.loadPage");
		$("#articles").html(html);
	};

	self.loadPage = function (author, page) {
		$.ajax({ 
			url: encodeURI(self.initCfg.apiRoot + "findGallery/" + author +"/" + 
						 page),
			type: 'GET', dataType: 'json', data: { },
			timeout: net.jadedungeon.ajaxTimeout,
			success: function(data, status, xhr) {
				if ('success' == data.status) {
					self.renderGallery(data);
					$('html,body').animate({scrollTop:0},700);
				} else {
					console.error("加载相册失败");
				}
			},
			error: function(xhr, errorType, error) {
				console.error("加载相册失败");
				console.debug(xhr);
				console.debug(errorType);
				console.debug(error);
			},
			complete: function(xhr, status) { }
		});
	};
})(jQuery);




(function ($) {
	net.jadedungeon.journal = function (cfg) { init(cfg); return this; };
	var self = net.jadedungeon.journal.prototype;
	var init = function (cfg) {
		net.jadedungeon = new net.jadedungeon();
		self.initCfg = cfg;
	};

	self.render = function () {
		net.jadedungeon.renderTopNav(self.initCfg);
		net.jadedungeon.renderSubTitle(self.initCfg);
		net.jadedungeon.renderPhotoFrame();
	};

	self.renderJournal = function (data) {
		var html = '<div class="spacer"></div>';
		$.each(data.articles, function (i, itm) {
			html = html + net.jadedungeon.renderArticle(itm);
		});
		html = html + net.jadedungeon.renderPagination(
			data.page, data.count, "page.loadPage");
		$("#articles").html(html);
		$("#articles>.item>.body>p>img").each(function (idx, item) {
			var img = $(item);
			img.unbind("click").bind("click", function (evt) {
				net.jadedungeon.viewPic(item);
			});
		});
	};

	self.loadPage = function (author, page) {
		$.ajax({ 
			url: encodeURI(self.initCfg.apiRoot + "findJournal/" + author + "/" + 
						 page), 
			type: 'GET', dataType: 'json', data: { },
			timeout: net.jadedungeon.ajaxTimeout,
			success: function(data, status, xhr) {
				if ('success' == data.status) {
					self.renderJournal(data);
					$('html,body').animate({scrollTop:0},700);
				} else {
					console.error("加载日记失败");
				}
			},
			error: function(xhr, errorType, error) {
				console.error("加载日记失败");
				console.debug(xhr);
				console.debug(errorType);
				console.debug(error);
			},
			complete: function(xhr, status) { }
		});
	};

})(jQuery);


var ccc = 5;
