from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.http import Request
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from scrapy.selector import HtmlXPathSelector
from scrapy import log
from quiz_parser.items import SimpleQuestion, MultipleChoice
import pprint, re, unicodedata
from datetime import datetime

pp = pprint.PrettyPrinter(indent=1, depth=1, width=200)

class MySpider(CrawlSpider):
    name = 'quizdatabase_questions'
    allowed_domains = ['quizdatabase.com']
    start_urls = [
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=10&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=9&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=8&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=7&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=6&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=5&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=4&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=3&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=2&SM=&KW=&KS=All',
            'http://www.quizdatabase.com/Browse.asp?Action=Process&Source=Page&Page=1&DF=0&CT=1&SM=&KW=&KS=All',
            ]

    rules = (
            Rule(SgmlLinkExtractor(allow=('Browse.asp\?Action=Process&Source=Page&Page=[0-9]+&DF=0&CT=[0-9]+&SM=&KW=&KS=[All|Any]$',), unique=True), callback='parse_questions'),
            )

    categories = {
            '10':'Entertainment/People',
            '9': 'Music',
            '8': 'Geography',
            '7': 'History',
            '6': 'Literature',
            '5': 'Science',
            '4': 'Films',
            '3': 'TV',
            '2': 'Sport',
            '1': 'General'
        }

    def parse_questions(self, response):
        self.log('Parsing questions: %s' % response.url, level=log.INFO)
    
        hxs = HtmlXPathSelector(response)
        params = {}
        for param in response.url.split('?')[1].split('&'):
            params[param.split('=')[0]] = param.split('=')[1]
        questions = hxs.select('/html/body/center/table/tbody/tr[2]/td/table/tbody/tr/td[2]/form/p[1]/table/tbody/tr[2]/td/table/tbody')
        for question in questions:
            simple_question = SimpleQuestion()
            simple_question['question'] = question.select('./tr[1]/td[1]/font').extract()[0].strip().replace('Q. ', '').replace(' ?', '?')
            simple_question['answer'] = question.select('./tr[2]/td[1]/font').extract()[0].strip().replace('A. ', '')
            simple_question['difficulty'] = question.select('./tr[3]/td[1]/font/i').extract()[0].strip().split(' ')[1]
            simple_question['subject'] = categories[params['CT']]
            yield simple_question
