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


