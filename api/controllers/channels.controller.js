import Tb_User from '../models/user'

export function getChannelsAll(req, res) {
    Tb_User.find({_id: req.user._id}, "-_id channels", function (err, result) {
        if (err) {
            return res.status(201).json({
                errCode: -1,
                errMsg: '渠道查询错误',
                data: {
                    error: err
                }
            });
        } else {
            let _options = {
                path: 'channels',
                options: {sort: {_id: -1}}
            }
            Tb_User.populate(result, _options, (err, _result)=> {
                if (err) {
                    return res.status(201).json({
                        errCode: -1,
                        errMsg: '渠道查询错误',
                        data: {
                            error: err
                        }
                    });
                }
                else if (!_result) {
                    result = [];
                    res.status(201).json({
                        errCode: 0,
                        errMsg: '',
                        data: {result}
                    });
                }
                else {
                    // TODO:应为populate中的options排序未起作用,所以直接使用数组排序的方式
                    result = _result[0].channels.sort((a, b)=> {
                        if (a._id > b._id) return -1;
                        if (a._id < b._id) return 1;
                        return 0;
                    });
                    if (req.body.query) {
                        result = result.filter((_item)=> {
                            return _item.channelCode.indexOf(req.body.query) !== -1 || _item.channelName.indexOf(req.body.query) !== -1
                        });
                    }
                    res.status(201).json({
                        errCode: 0,
                        errMsg: '',
                        data: {result}
                    });
                }
            });
        }
    })
}

export function createChannels(req, res) {
    if (!req.body.code || !req.body.name) {
        res.status(201).json({
            errCode: 40001,
            errMsg: '渠道编码或名称',
            data: {}
        });
    }
    else {
        let newChanel = {
            channelCode: req.body.code,
            channelName: req.body.name
        };
        Tb_User.find({_id: req.user._id}, (err, _tbUser)=> {
            if (err) {
                return res.status(201).json({
                    errCode: -1,
                    errMsg: '添加渠道前查询错误',
                    data: {
                        error: err
                    }
                });
            }
            else {
                if (!_tbUser) {
                    return res.status(201).json({
                        errCode: -1,
                        errMsg: '添加渠道前查询错误',
                        data: {
                            error: '未找到当前用户数据'
                        }
                    });
                }
                else {
                    let result = _tbUser[0].channels.filter((_item)=> {
                        return _item.channelCode === newChanel.channelCode || _item.channelName === newChanel.channelName
                    });
                    if (result.length > 0) {
                        return res.status(201).json({
                            errCode: 40002,
                            errMsg: '渠道编码或名称',
                            data: {
                                error: '渠道编码或名称已存在'
                            }
                        });
                    }
                    _tbUser[0].channels.push(newChanel);
                    _tbUser[0].save((err)=> {
                        if (err) {
                            return res.status(201).json({
                                errCode: -1,
                                errMsg: '创建渠道错误',
                                data: {
                                    error: err
                                }
                            });
                        }
                        else {
                            getChannelsAll(req, res);
                        }
                    })
                }
            }
        });
    }
}

export function removeChannels(req, res) {
    if (!req.body.id) {
        res.status(201).json({
            errCode: 40001,
            errMsg: '渠道ID',
            data: {}
        });
    }
    else {
        Tb_User.find({_id: req.user._id}, (err, _tbUser)=> {
            if (err) {
                return res.status(201).json({
                    errCode: -1,
                    errMsg: '渠道删除前查询错误',
                    data: {
                        error: err
                    }
                });
            }
            else {
                if (!_tbUser) {
                    return res.status(201).json({
                        errCode: -1,
                        errMsg: '渠道删除前查询错误',
                        data: {
                            error: '未找到当前用户对应数据'
                        }
                    });
                }
                else {
                    _tbUser[0].channels.id(req.body.id).remove();
                    _tbUser[0].save((err)=> {
                        if (err) {
                            return res.status(201).json({
                                errCode: -1,
                                errMsg: '渠道删除错误',
                                data: {
                                    error: err
                                }
                            });
                        }
                        else {
                            getChannelsAll(req, res);
                        }
                    })
                }
            }
        });
    }
}