# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/topics/item-pipeline.html
from scrapy.xlib.pydispatch import dispatcher
from scrapy import signals, log
from scrapy.contrib.exporter import BaseItemExporter
from scrapy.exceptions import DropItem
from quiz_parser.items import SimpleQuestion, MultipleChoice
from bson import BSON
import json, os, ast

class JsonItemExporter(BaseItemExporter):
    def __init__(self, **kwargs):
        self._configure(kwargs)
        if not os.path.isdir('json'):
            os.mkdir('json')
        if not os.path.isdir('json/questions'):
            os.mkdir('json/questions')
        self.simple_question_file = open('json/questions/simple-question.json', 'w+b')
        self.multiple_choice_file = open('json/questions/multiple-choice.json', 'w+b')

    def export_item(self, item):
        itemdict = dict(self._get_serialized_fields(item))
        if isinstance(item, MultipleChoice):
            self.multiple_choice_file.write(json.dumps(itemdict, separators=(',', ':')) + '\n')
        if isinstance(item, SimpleQuestion):
            self.simple_question_file.write(json.dumps(itemdict, separators=(',', ':')) + '\n')

    def finish_exporting(self):
        self.multiple_choice_file.close()
        self.simple_question_file.close()

class BsonItemExporter(BaseItemExporter):
    def __init__(self, **kwargs):
        self._configure(kwargs)
        if not os.path.isdir('bson'):
            os.mkdir('bson')
        if not os.path.isdir('bson/questions'):
            os.mkdir('bson/questions')
        self.simple_question_file = open('bson/questions/simple-question.bson', 'w+b')
        self.multiple_choice_file = open('bson/questions/multiple-choice.bson', 'w+b')

    def export_item(self, item):
        itemdict = dict(self._get_serialized_fields(item))
        if isinstance(item, MultipleChoice):
            self.multiple_choice_file.write(BSON.encode(itemdict) + '\n')
        if isinstance(item, SimpleQuestion):
            self.simple_question_file.write(BSON.encode(itemdict) + '\n')

    def finish_exporting(self):
        self.multiple_choice_file.close()
        self.simple_question_file.close()

class QuestionExportPipeline(object):
    def __init__(self):
        dispatcher.connect(self.spider_opened, signals.spider_opened)
        dispatcher.connect(self.spider_closed, signals.spider_closed)
        self.files = {}

    def spider_opened(self, spider):
        self.json_exporter = JsonItemExporter()
        self.json_exporter.start_exporting()
        self.bson_exporter = BsonItemExporter()
        self.bson_exporter.start_exporting()

    def spider_closed(self, spider):
        self.json_exporter.finish_exporting()
        self.bson_exporter.finish_exporting()

    def process_item(self, item, spider):
        spider.log('Exporting %s to json file' % item.__class__.__name__, level=log.INFO)
        self.json_exporter.export_item(item)
        spider.log('Exporting %s to bson file' % item.__class__.__name__, level=log.INFO)
        self.bson_exporter.export_item(item)
        #raise DropItem("Done with this item")
        return item
