package net.jadedungeon.blog

import jadeutils.common.Logging

import scala.collection.JavaConversions._

import jadeutils.mongo.MongoServer
import jadeutils.mongo.BaseMongoDao
import jadeutils.mongo.Condition.newCondition

class JournalDao(serverList: java.util.List[MongoServer])
extends BaseMongoDao[Journal](serverList) with Logging 
{
	def this(host: String, port: Int, auth: List[Array[String]]) = this(new MongoServer(host, port, auth) :: Nil)

	def findJournal(auth: String, page: Int): (Int, List[Journal]) = {
		val count = 1
		val recs = this.findByCondition(newCondition("auth", auth)).sort(
			newCondition("logTime",-1)).toList.toList
		(count, recs)
	}

}


class GalleryDao(serverList: java.util.List[MongoServer])
extends BaseMongoDao[Gallery](serverList) with Logging 
{
	def this(host: String, port: Int, auth: List[Array[String]]) = this(new MongoServer(host, port, auth) :: Nil)

	def findGallery(auth: String, page: Int): (Int, List[Gallery]) = {
		val count = 1
		val recs = this.findByCondition(newCondition("auth", auth)).sort(
			newCondition("logTime",-1)).toList.toList
		(count, recs)
	}

}
