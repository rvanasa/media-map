import React, {useState} from 'react';

import './App.scss';

import Graph from 'vis-react';
import {Button, Card, Col, ListGroup, Row} from 'react-bootstrap';
import articles from '../data/data';

console.log(articles);

function filterThing(s) {
    return ['//', '#', '$', '@'].every(p => !s.startsWith(p)) && !parseFloat(s);
}

function getScore(a) {
    let as = a.sentiment;
    let ts = a.triple_sentiment;

    return as.very_positive ** 3 + ts.very_positive ** 2 - as.very_negative ** 2 - ts.very_negative ** 2 - as.negative ** 2 - ts.negative ** 2 + as.neutral + ts.neutral - a.insult_rating ** 2 * 100;
}

articles.forEach(a => {
    a.entities = a.entities.filter(filterThing);
    a.concepts = a.concepts.filter(filterThing);
    a.triples = a.triples.filter(([a, v, b]) => filterThing(a) && filterThing(v) && filterThing(b));

    a.score = getScore(a);
});

export default function App() {
    let [selected, setSelected] = useState(null);
    let [unsorted, setUnsorted] = useState(false);

    let sentimentNames = {
        very_positive: 'Very Positive',
        very_negative: 'Very Negative',
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
    };

    let technologies = [
        ['News scraping', ['NewsAPI', '(news-please)']],
        ['Sentence tokenization', ['NLTK']],
        ['Coreference resolution', ['SpaCy', 'NeuralCoref']],
        ['Contraction resolution', ['(contractions)']],
        ['Insult detection', ['BERT', 'Kaggle']],
        ['Named entity recognition', ['OntoNotes']],
        ['Morphological tagging', ['UD2.0']],
        ['Sentiment classification', ['BERT', 'Stanford Sentiment Treebank']],
        ['Ontology learning', ['NLTK']],
        ['Treebank parsing', ['DeepPavlov']],
    ];
    let notes = [
        'This algorithm works by reading emotional sentiment and checking how much the average sentence of an article resembles an insult.',
        'It appears that this is working with the current bombardment of COVID-19 news, filtering out many of the articles clearly designed to induce fear or anger.',
        'Since this was created fairly quickly for the ATLS 2000 midterm, I am using low-resolution models for experimentation. As a result, the sentiment ratings are nowhere near as accurate as their full potential.',
        'Scores do not yet account for the reputation of the news outlet.',
        'The named entity and association lists occasionally have some very weird data, but this is fine because it still gives a useful hint about the article\'s contents.',
        'I used this project as an opportunity to learn more about deep learning and natural language processing. I had no idea whether this would work, so it\'s satisfying to see this actually filter out many of the highly sensational articles.',
    ];

    function round(n, digits = 3) {
        let exp = 10 ** digits;
        return Math.round(n * exp) / exp;
    }

    function graphComponent(article) {

        let graph = {
            // nodes: article.concepts.map(s => ({id: s})),
            nodes: [...new Set(article.triples.flatMap(([a, _, b]) => [a, b]))].map(s => ({id: s, label: s})),
            edges: article.triples.map(([sub, verb, obj]) => ({from: sub, to: obj, label: verb})),
        };

        console.log(graph);

        let options = {
            layout: {
                improvedLayout: false,
                // hierarchical: {
                //     direction: 'LR',
                //     nodeSpacing: 80,
                //     levelSeparation: 100,
                // },
            },
            nodes: {
                color: '#2222',
                // scaling:'square'
            },
            edges: {
                color: '#2222',
            },
            interaction: {
                hoverEdges: true,
            },
            physics: {
                // enabled: false,
                repulsion: {
                    nodeDistance: 5,
                },
                maxVelocity: 5,
            },
        };

        return (
            <Graph graph={graph} options={options}/>
        );
    }

    return (
        <div className="py-4">
            <div className="px-4">
                <Card>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <h2>What is this?</h2>
                                <hr/>
                                <h5 className="my-4">
                                    <span className="text-success">Media Map</span> is my idea for a deep learning
                                    pipeline to combat media sensationalism. By assigning a score to each news article
                                    using topics, associations, and sentiment, it is possible to filter out articles
                                    with particularly loaded or inflammatory language.
                                </h5>
                                <h5 className="my-4">The following technologies are used in this algorithm:</h5>
                                <ListGroup className="mb-5">
                                    {technologies.map(([role, tools], i) => (
                                        <ListGroup.Item key={i}>
                                            <h6 className="mb-0">{role} <small
                                                className="text-muted font-weight-light">| {tools.join(' / ')}</small>
                                            </h6>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Col>
                            <Col md={6}>
                                <h2>A few things to note:</h2>
                                <hr/>
                                <ListGroup className="my-4">
                                    {notes.map((note, i) => (
                                        <ListGroup.Item key={i}>
                                            <h5 className="my-2">{note}</h5>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Col>
                        </Row>
                        <h3 className="text-center text-muted">
                            Goal: reduce the prominence of fear-inducing articles in the top headlines for March 21st.
                        </h3>
                    </Card.Body>
                </Card>
            </div>
            <hr/>
            <div className="btn btn-lg btn-outline-success d-block py-3 m-4" onClick={() => setUnsorted(!unsorted)}>
                Sorting by {unsorted ? 'Most Recent' : 'Algorithm Score'}
            </div>
            {[...articles].sort((a, b) => unsorted ? 0 : b.score - a.score).map((article, i) => (
                <div key={i} className="px-4">
                    <Card className="mb-4">
                        <Card.Body>
                            <div className="px-4 clickable" onClick={() => window.open(article.url)}>
                                <h4 className="mb-0 text-success float-right">
                                    <span className="text-muted">Score:</span> {round(article.score)}
                                </h4>
                                <h4 className="mb-1">
                                    <span>{article.source}</span> | <span
                                    className="font-weight-bold">{article.title}</span>
                                </h4>
                            </div>
                            <Row className="w-100">
                                <Col md={6}>
                                    <hr/>
                                    {Object.entries(article.sentiment).map(([k, v]) => (
                                        <h5 key={k}>{sentimentNames[k]}: {round(v)}</h5>
                                    ))}
                                    <h5>Direct: {round(article.insult_rating ** 2 * 100)}</h5>
                                    <hr/>
                                    <h6 style={{opacity: .9}}>
                                        {article.entities.join(', ')}
                                    </h6>
                                    <div className="text-muted font-weight-lighter">
                                        {article.concepts.filter(c => !article.entities.includes(c)).join(' ~ ')}
                                    </div>
                                </Col>
                                <Col md={6} className="h-100">
                                    <hr/>
                                    <Button variant="outline-light" className="w-100"
                                            onClick={() => setSelected(selected === article ? null : article)}>
                                        {selected === article ? 'Hide' : 'Show'} Visualization
                                    </Button>
                                    <hr/>
                                    {selected === article && (
                                        <div className="bg-white w-100" style={{height: '80vh'}}>
                                            {graphComponent(article)}
                                        </div>
                                    )}
                                    {selected !== article && article.triples.map(([a, v, b], i) => (
                                        <div key={i}>
                                            <span className="text-danger">{a} </span>
                                            <span className="text-muted">{v} </span>
                                            <span className="text-info">{b}</span>
                                        </div>
                                    ))}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <hr/>
                </div>
            ))}
        </div>
    );
};
