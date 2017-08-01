const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

process.env.MONGODB_URI = 'mongodb://localhost:27017/hollywood-test';

require('../../lib/connect');

const connection = require('mongoose').connection;

const app = require('../../lib/app');

const request = chai.request(app);

describe('studios REST api',()=>{
    before(() => connection.dropDatabase());

    const lucasFlm = {
        name: 'Lucas Film',
        address: {
            city: 'San Francisco',
            state: 'CA',
            zip: 99999
        }
    };
    const mucusFilm = {
        name: 'Mucus Film',
        address:{
            city: 'sanfan',
            state: 'Cali',
            zip: 32771

        }
    };

    const slvCup = {
        name: 'Silvercup',
        address: {
            city: 'Queens',
            state: 'NY',
            zip: 11101
        }
    };
    
    const ealStu = {
        name: 'Ealing Studios'
    };
    function saveStudio(studio) {
        return request.post('/api/studios')
            .send(studio)
            .then(({body}) => {
                studio._id = body._id;
                studio.__v = body.__v;
                return body;
            });

    }
    it('saves a studio', () => {
        return saveStudio(mucusFilm)
            .then(savedStudio => {
                assert.isOk(savedStudio._id);
                assert.equal(savedStudio.name, mucusFilm.name);
                assert.deepEqual(savedStudio.address, mucusFilm.address);
            });
    });

    it('GETs studio if it exists', () => {
        return request
            .get(`/api/studios/${mucusFilm._id}`)
            .then(res => res.body)
            .then(studio => {
                assert.equal(studio.name, mucusFilm.name);
                assert.deepEqual(studio.address, mucusFilm.address);
            });
    });

    it('returns 404 if studio does not exist', () => {
        return request.get('/api/studios/58ff9f496aafd447254c29b5').then(
            () => {
                //resolve
                throw new Error('successful status code not expected');
            },
            ({ response }) => {
                //reject
                assert.ok(response.notFound);
                assert.isOk(response.error);
            }
        );
    });

    it('GET all studios', () => {
        return Promise.all([
            saveStudio(slvCup),
            saveStudio(ealStu),
        ])
            .then(() => request.get('/api/studios'))
            .then(res => {
                const studios = res.body;
                assert.deepEqual(studios, [mucusFilm, slvCup, ealStu]);
            });
    });
    it('rewrites studio data by id', ()=>{
        return request.put(`/api/studios/${mucusFilm._id}`)
            .send(lucasFlm)
            .then(res => {
                assert.isOk(res.body._id);
                assert.equal(res.body.name,lucasFlm.name);
                assert.equal(res.body.age,lucasFlm.age);
            });
    });
    it('deletes studio by id', () =>{
        return request.delete(`/api/studios/${slvCup._id}`)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text), { removed: true });
            });
    });
    it('fails to delete studio by id', () =>{
        return request.delete(`/api/studios/${slvCup._id}`)
            .then(res => {
                assert.deepEqual(JSON.parse(res.text), { removed: false });
            });
    });
            
});