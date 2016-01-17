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
		self.renderJournal(self.initCfg.articles);
	};

	self.renderJournal = function (articles) {
		var html = '<div class="spacer"></div>';
		$.each(articles, function (i, itm) {
			html = html + net.jadedungeon.renderArticle(itm);
		});
		$("#articles").html(html);
	};

})(jQuery);


