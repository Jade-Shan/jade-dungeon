package net.jadedungeon.blog

import org.json4s._
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods._

import scala.collection.JavaConversions._

import jadeutils.common.Logging

import jadeutils.web.BasicController
import jadeutils.web.DispatherInfo
import jadeutils.web.DispatherServlet.Foward
import jadeutils.web.DispatherServlet.Redirect
import jadeutils.web.Method._

trait BaseBlogController extends BasicController with BlogAppCtx

object BlogRecController extends BaseBlogController with Logging {

	service("/api/blog/findJournal/${auth}/${page}") {(info) => {
		info.response.setHeader("Access-Control-Allow-Origin", "*")
		val auth = java.net.URLDecoder.decode(info.params("auth")(0), "UTF-8")
		val page = info.params("page")(0).toInt
		try {
			val recs = findJournal(auth, page)
			logDebug("query reault: {}", recs)
			("status" -> "success") ~ ("page" -> page) ~ ("count" -> recs._1) ~ 
			("articles" -> (if (null != recs._2) { recs._2 } else Nil).map(
				r => ("time" -> r.time) ~("auth" -> r.auth) ~ ("title" -> r.title) ~
				("text" -> r.text))) : JValue
		} catch {
			case e: Exception => {
				e.printStackTrace()
				logError(e.toString)
				("status" -> "error") ~ ("err" -> e.toString): JValue
			}
		}
	}}

	service("/api/blog/recordJournal") {(info) => {
		try {
			val auth = info.params("auth")(0)
			val title = info.params("title")(0)
			val time = System.currentTimeMillis //(info.params("time")(0)).toLong
			val text = info.params("text")(0)

			val rec = new Journal(title, auth, time, text)
			logDebug("record Journal rec: {}" + rec)
			RecDaos.journalDao.insert(rec)
			("status" -> "success"): JValue
		} catch {
			case e: Exception => {
				e.printStackTrace()
				logError(e.toString)
				("status" -> "error") ~ ("err" -> e.toString): JValue
			}
		}
	}}

	service("/api/blog/findGallery/${auth}/${page}") {(info) => {
		info.response.setHeader("Access-Control-Allow-Origin", "*")
		val auth = java.net.URLDecoder.decode(info.params("auth")(0), "UTF-8")
		val page = info.params("page")(0).toInt
		try {
			val recs = findGallery(auth, page)
			// logDebug("query reault: {}", recs)
			val c = recs._2(0).images
			logDebug("query cc: {}", c.get(0).getClass)
			("status" -> "success") ~ ("page" -> page) ~ ("count" -> recs._1) ~ 
			("articles" -> (if (null != recs._2) { recs._2 } else Nil).map(
				r => ("time" -> r.time) ~("auth" -> r.auth) ~ ("title" -> r.title) ~
				("text" -> r.text) ~ ("ablum" -> 
					(for (k <- 0 until r.images.size) yield r.images.get(k)).map(p => (
						("id" -> p.id) ~ ("title" -> p.title) ~ ("desc" -> p.desc) ~ 
						("url"-> p.url)))))) : JValue
		} catch {
			case e: Exception => {
				e.printStackTrace()
				logError(e.toString)
				("status" -> "error") ~ ("err" -> e.toString): JValue
			}
		}
	}}

	service("/api/blog/recordGallery") {(info) => {
		try {
			val auth = info.params("auth")(0)
			val title = info.params("title")(0)
			val time = System.currentTimeMillis //(info.params("time")(0)).toLong
			val text = info.params("text")(0)
			val ll = drawImage(info)

			val rec = new Gallery(title, auth, time, text, ll)
			logDebug("record Gallery rec: {}", rec)
			RecDaos.galleryDao.insert(rec)
			("status" -> "success"): JValue
		} catch {
			case e: Exception => {
				e.printStackTrace()
				logError(e.toString)
				("status" -> "error") ~ ("err" -> e.toString): JValue
			}
		}
	}}

	private[this] def drawImage(info: DispatherInfo) = {
			val id  = info.params("id")
			val tit = info.params("tit")
			val dsc = info.params("dsc")
			val ul  = info.params("ul")

			var ll: List[Pic] = Nil
			if (id.length > 0) {
				(0 until id.length).foreach(
					(i) => { ll = new Pic(id(i), ul(i), tit(i), dsc(i)) :: ll })
			}

			ll
	}


}

