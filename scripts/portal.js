var net = net || {};
(function ($) {
	net.jadedungeon = function () { init(); return this; };
	var self = net.jadedungeon.prototype;
	var init = function (cfg) {
		self.ui = {};
		self.data = {};

		self.markdown = new showdown.Converter();

		self.data.nav = [ {title: "Journal", link: "/"},
			{title: "Gallery", link: "/gallery.html"},
			{title: "Note", link: "/notes/", isNewWin: true},
			{title: "About Me", subs: [
				{title: "Github", link: "https://github.com/Jade-Shan/", isNewWin: true},
				{title: "", link: ""},
				{title: "Resume", link: "/content/qiwei-resume.html", isNewWin: true}]
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
		self.renderArticles(self.initCfg.articles);
	};

	self.renderArticles = function (articles) {
		var html = '<div class="spacer"></div>';
		$.each(articles, function (i, itm) {
			html = html + '<div class="item">';
			html = html + '<div class="title">' + itm.title + '</div>';
			var t = (new Date());
			t.setTime(itm.time);
			html = html + '<div class="metadata">' + t.toLocaleString() +
				' by ' + itm.auth + '</div>';
			html = html + '<div class="body">' + 
				net.jadedungeon.markdown.makeHtml(itm.text) + '</div></div>';
			html = html + '<div class="divider"><span></span></div>';
			$("#articles").html(html);
		});
	};

})(jQuery);


