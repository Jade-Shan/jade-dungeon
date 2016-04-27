package net.jadedungeon.blog

import jadeutils.common.Logging

trait BlogRecService {
	this: BlogRecDaoCompoment =>

	def findJournal(auth: String, page: Int): (Int, List[Journal]) = {
		this.RecDaos.journalDao.findJournal(auth, page)
	}

	def findGallery(auth: String, page: Int): (Int, List[Gallery]) = {
		this.RecDaos.galleryDao.findGallery(auth, page)
	}

}
