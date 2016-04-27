package net.jadedungeon.blog

import jadeutils.mongo._

/* ================================================================= */
/*                  Modles for jade blog                             */
/* ================================================================= */

@MongoDocument(databaseName="jadedungeon", collectionName="journal")
case class Journal(
	tit: String, auh: String, ts: Long, tx: String) extends MongoModel
{
	def this() = this(null, null, 0, null)

	@MongoField var title = tit
	@MongoField var auth = auh
	@MongoField var time = ts
	@MongoField var text = tx

	override def toString = ("""JournalRecord: {title: "%s", auth: "%s", """ + 
		"""time: "%d", text: "%s"}""").format(title, auth, time, text)
}

case class Pic(s: String, u: String, tit: String, dsc: String) 
{
	def this() = this (null, null, null, null)

	@MongoField var id = s
	@MongoField var title = tit
	@MongoField var url = u
	@MongoField var desc = dsc

	override def toString = ("""{id: "%s", title: "%s", url : "%s", """ + 
		"""desc: "%s"}""").format(id, title, url, desc)
}

@MongoDocument(databaseName="jadedungeon", collectionName="gallery")
case class Gallery(
	tit: String, auh: String, ts: Long, tx: String, ms: java.util.List[Pic]) 
extends MongoModel
{
	def this() = this(null, null, 0, null, null)

	@MongoField var title = tit
	@MongoField var auth = auh
	@MongoField var time = ts
	@MongoField var text = tx
	@MongoField(ElemType = classOf[Pic]) var images = ms

	override def toString = ("""JournalRecord: {title: "%s", auth: "%s", """ + 
		"""time: "%d", text: "%s", images:[%s]}""").format(title, auth, time, 
		text, images.toString)
}
