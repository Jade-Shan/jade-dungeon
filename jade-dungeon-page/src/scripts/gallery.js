/* jshint esversion: 6 */
(function ($) {
	net.jadedungeon.gallery = function (cfg) { init(cfg); return this; };
	var self = net.jadedungeon.gallery.prototype;
	var init = function (cfg) {
		net.jadedungeon = new net.jadedungeon();
		self.initCfg = cfg;
	};

	self.render = function () {
		net.jadedungeon.renderTopNav(self.initCfg);
		net.jadedungeon.renderThemeSwitcher(self.initCfg);
		net.jadedungeon.renderSubTitle(self.initCfg);
		net.jadedungeon.loadUserById(self.initCfg.apiRoot, self.initCfg.authorId);
		net.jadedungeon.loadRecommadArticles(self.initCfg.apiRoot);
		net.jadedungeon.renderPhotoFrame();
	};

	self.renderGallery = function (data) {
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

	self.loadPage = function (page) {
		var authorId = self.initCfg.authorId;
		self.loadGallery(authorId, page);
	};
	self.loadGallery = function (authorId, page) {
		$.ajax({ 
			url: encodeURI(self.initCfg.apiRoot + "findGalleryByUser/" + authorId +"/" + 
						 page),
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
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



