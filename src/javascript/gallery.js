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
		self.renderGallery(self.initCfg.articles);
	};

	self.renderGallery = function (articles) {
		var html = '<div class="spacer"></div>';
		$.each(articles, function (i, itm) {
			html = html + net.jadedungeon.renderArticle(itm);
		});
		$("#articles").html(html);
	};
})(jQuery);



