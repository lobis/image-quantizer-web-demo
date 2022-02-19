FROM node:latest as build-client

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . ./

RUN yarn build


FROM python:latest

WORKDIR /app

ENV FLASK_APP=server

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN pip install --index-url https://test.pypi.org/simple/ image-quantizer

EXPOSE 5000

COPY server/ ./server/

COPY --from=build-client /app/dist /app/dist

CMD ["flask", "run", "--host=0.0.0.0"]
