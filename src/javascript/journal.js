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

	self.loadPage = function (page) {
		$.ajax({ url: self.initCfg.apiRoot + page + '.json', 
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
