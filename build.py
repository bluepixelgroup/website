import os
import json
import jinja2
from datetime import datetime


def render(tpl_path, context):
    path, filename = os.path.split(tpl_path)
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(path or './')
    ).get_template(filename).render(context)

def main():
    with open('database.json') as f:
        context = json.loads(f.read())

    context['current_year'] = datetime.now().year
    template = render('src/html/index.html', context)
    print (template)


if __name__ == '__main__':
    main()

