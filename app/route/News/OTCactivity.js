import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Platform, ListView, StyleSheet, Image, View, Text, TextInput, RefreshControl, Switch, TouchableOpacity, ImageBackground, ScrollView  } from 'react-native';
import moment from 'moment';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import Header from '../../components/Header'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import ModalDropdown from 'react-native-modal-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons'
import CountDownReact from '../../components/CountDownReact'
var dismissKeyboard = require('dismissKeyboard');
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({wallet, assets, news,}) => ({...wallet, ...assets, ...news,}))
class OTCactivity extends BaseComponent {

    static navigationOptions = {
        title: '活动详情',
        header:null,  
    };

    // 构造函数  
    constructor(props) { 
        super(props);
        this.state = {
            labelname: '', //输入账号
            showMore: true,
            nameList: [],
            periodsList: [],
            logRefreshing: false, //下拉刷新
            cactivityYN: '', //活动是否开始
            searchResult: '', //搜索结果
            periodstext: '第一期', //当前进行第几期活动
            periodsseq: 1, //当前进行第几期下标
            choicePeriods: 1, //选择了下拉列表的哪个下标
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
        }
    }

    componentDidMount() {
        try {
            this.setState({logRefreshing: true});
            this.props.dispatch({type: 'news/getInfo', payload:{activityId:"1"},callback: (datainfo) => {
                this.setState({cactivityYN: datainfo.status,});
                this.props.dispatch({type: 'news/getActivityStages', payload:{activityId:"1"},callback: (periodsdata) => {
                    let arr = periodsdata;
                    let arr1 = [];
                    for(var i = 0; i < arr.length; i++){
                        arr1.push(arr[i].name);
                        if(periodsdata[i].status == 'doing'){
                            this.setState({
                                periodstext: periodsdata[i].name,
                                periodsseq: periodsdata[i].seq,
                            })
                        }
                    }
                    this.setState({ periodsList: arr1});
                    this.props.dispatch({type: 'news/getWinActivityStageUsers', payload:{activityStageId:this.state.periodsseq},callback: (data) => {
                        //alert(this.state.periodsseq+JSON.stringify(data));
                        if(data && data.length > 0){
                           
                            this.setState({
                                nameList: data,
                                logRefreshing: false,
                                labelname: '',
                                searchResult: '',
                            });
                        }
                        this.setState({logRefreshing: false});
                    } });
                } });
            } });
        } catch (error) {
            console.log(error.message);
        }
    }

    onRefreshing(index) {
        try {
            this.setState({logRefreshing: true});
            this.props.dispatch({type: 'news/getWinActivityStageUsers', payload:{activityStageId:index},callback: (data) => {
                //alert(index+JSON.stringify(data));
                this.setState({
                    nameList: data,
                    labelname: '',
                    searchResult: '',
                    logRefreshing: false,
                });
            } });
        } catch (error) {
            console.log(error.message);
        }
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    //查看
    _query =(labelname) => {
        //alert(this.state.choicePeriods)
        this.dismissKeyboardClick();
        if (labelname == "") {
            EasyToast.show('请输入账号');
            return;
        }
        if(labelname.length != 12 ){
            EasyToast.show("账号有误，请重新输入");
            return;
        }
        try {
            this.setState({logRefreshing: true});
            this.props.dispatch({type: 'news/getWinActivityStageUsers', payload:{activityStageId:this.state.choicePeriods,accountName:labelname.toLowerCase()},callback: (data) => {
                if(data.length == 0){
                    this.setState({
                        searchResult: '该账号未中奖',
                        nameList: data,
                        logRefreshing: false
                    });
                }else{
                    this.setState({
                        searchResult: data[0].isWinner=='y'&&data[0].isLucky=='y'?"恭喜您获得幸运奖及优胜奖！":data[0].isWinner=='n'&&data[0].isLucky=='y'?"恭喜您获得幸运奖！":"恭喜您获得优胜奖！",
                        nameList: data,
                        logRefreshing: false
                    });
                }
            } });
        } catch (error) {
            console.log(error.message);
        }
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

     //转换时间
    transferTimeZone(datatime){
        if(this.state.cactivityYN == 'doing'){
            let timezone = moment(datatime).add(24,'hours').format('YYYY-MM-DDTHH:mm:ss');
            return  timezone;
        }else if(this.state.cactivityYN == 'new'){
            return  '00:00:00';
        }else if(this.state.cactivityYN == 'completed'){
            return  '00:00:00';
        }
    }

    getonSelect(idx,value){
        this.onRefreshing(parseInt(idx)+1);
        this.setState({choicePeriods:parseInt(idx)+1})
    }

    dropdownwillShow(){
        this.setState({
            showMore: !this.state.showMore,
        })
    }

    dropdownwillHide(){
        this.setState({
            showMore: !this.state.showMore,
        })
    }

    explain(){
        const { navigate } = this.props.navigation;
        navigate('Web', { title: '活动说明', url: 'http://static.eostoken.im/html/20180921/1537495245881.html' });
    }

    render() {
        return (
            <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
                <Header {...this.props} onPressLeft={true} title="活动详情" />
                <ImageBackground source={UImage.app16} resizeMode="stretch" style={styles.linebgout}>
                    <Image source={UImage.app12} style={styles.signedimg}/>
                    <View style={styles.header}>  
                        <View style={{width:ScreenUtil.autowidth(100),  height: ScreenUtil.autoheight(25),flexDirection: 'row', borderWidth: 1,borderRadius: 3,justifyContent: 'space-between',borderColor:UColor.riceWhite,backgroundColor:UColor.btnColor,paddingHorizontal: ScreenUtil.autowidth(10),}}>
                            <ModalDropdown options={this.state.periodsList} defaultValue={this.state.periodstext}
                            style={{flex: 1,height: ScreenUtil.autoheight(25),justifyContent: 'center',}}
                            textStyle={{fontSize: ScreenUtil.setSpText(12),color: UColor.startup,}}
                            dropdownStyle={{width:ScreenUtil.autowidth(80),height: ScreenUtil.autowidth(200),top:0,}} defaultIndex={this.state.periodsseq-1}
                            onSelect={(idx,value) => this.getonSelect(idx,value)}
                            onDropdownWillShow={this.dropdownwillShow.bind(this)}
                            onDropdownWillHide={this.dropdownwillHide.bind(this)}
                            />
                            <Ionicons name={this.state.showMore ? "md-arrow-dropdown" : "md-arrow-dropright"} size={20} style={{lineHeight: ScreenUtil.autoheight(25),color:UColor.arrow}}/>
                        </View>
                        <View style={[styles.inptout,{borderColor:UColor.riceWhite,backgroundColor:UColor.btnColor}]} >
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} placeholderTextColor={UColor.arrow} 
                                selectionColor={UColor.tintColor} style={[styles.inpt,{color: UColor.startup}]} placeholder="输入账号" 
                                underlineColorAndroid="transparent" onChangeText={(labelname) => this.setState({ labelname })}
                                autoCorrect={true} returnKeyType="go" keyboardType="default"  maxLength={12} />
                        </View>    
                        <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)} style={{width:ScreenUtil.autowidth(60),height:ScreenUtil.autowidth(24),borderRadius: 3, backgroundColor: UColor.tintColor,alignItems: 'center',justifyContent: 'center',}}>  
                            <Text style={[styles.canceltext,{color: UColor.btnColor}]}>查看</Text>
                        </TouchableOpacity>   
                    </View> 
                    <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#FF5353', textAlign: 'center'}}>{this.state.searchResult}</Text>
                    <View style={{flexDirection: 'row',justifyContent:'space-around'}}>
                        <TouchableOpacity style={{alignItems: 'center',justifyContent:'flex-end'}} onPress={this.explain.bind(this)}>
                            <View style={{height: ScreenUtil.autoheight(18),paddingHorizontal: ScreenUtil.autowidth(5), borderRadius: 5, flexDirection: 'row',backgroundColor: UColor.tintColor,alignItems: 'center',justifyContent:'center'}}>
                                <Image source={UImage.app17} style={styles.explainimg} />
                                <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#FFFFFF'}} >活动说明</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{alignItems: 'center',justifyContent:'flex-end'}}>
                            <View style={{flexDirection: 'row',alignItems: 'center',justifyContent:'flex-end'}}>
                                <Image source={UImage.app19} style={styles.luckyimg} />
                                <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#C25C5C'}} >优胜奖</Text>
                            </View>
                        </View>
                        <View style={{alignItems: 'center',justifyContent:'flex-end'}}>
                            <View style={{flexDirection: 'row',alignItems: 'center',justifyContent:'flex-end'}}>
                                <Image source={UImage.app18} style={styles.frontimg} />
                                <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#2279C5'}} >幸运奖</Text>
                            </View>
                        </View>
                        
                        <View style={{flexDirection: 'column',alignItems: 'center',justifyContent:'flex-end'}}>
                            <CountDownReact date= {this.transferTimeZone(moment().format('YYYY-MM-DD ' +  '00:00:00'))} hours=':'  mins=':'
                                hoursStyle={[styles.ratiotext,{color: '#2279C5'}]} minsStyle={[styles.ratiotext,{color: '#2279C5'}]}
                                secsStyle={[styles.ratiotext,{color: '#2279C5'}]} firstColonStyle={[styles.ratiotext,{color: '#2279C5'}]}
                                secondColonStyle={[styles.ratiotext,{color: '#2279C5'}]}
                                />
                            <Text style={{fontSize: ScreenUtil.setSpText(12),color: '#5B6B86'}} >{this.state.periodstext}活动倒计时</Text>
                        </View>
                    </View>
                    <View style={[styles.listViewStyle,{backgroundColor: 'rgba(187, 223, 251, 0.8)'}]}>
                        <ListView  enableEmptySections={true}  contentContainerStyle={{flexWrap:'wrap',flexDirection:'row', alignItems:'center',}}
                            removeClippedSubviews={false}
                            refreshControl={<RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing(this.state.choicePeriods)} 
                            tintColor={UColor.fontColor} colors={[UColor.tintColor]} progressBackgroundColor={UColor.btnColor}
                            style={{backgroundColor: UColor.transport}}/>}
                            dataSource={this.state.dataSource.cloneWithRows(this.state.nameList == null ? [] : this.state.nameList)} 
                            renderRow={(rowData) => (  
                                <ImageBackground source={rowData.isWinner=='y'&&rowData.isLucky == 'y' ? UImage.app13 : rowData.isWinner=='n'&&rowData.isLucky == 'y'?UImage.app14:UImage.app15} resizeMode="stretch" style={styles.namelist}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(10),color: '#C25C5C' }}>{rowData.accountName}</Text>
                                </ImageBackground>
                            )}                
                        /> 

                    </View>
                    
                </ImageBackground>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
    },

    linebgout: {
        width: ScreenWidth,
        minHeight: ScreenWidth * 1.617,
    },
    signedimg: {
        width: ScreenWidth-ScreenUtil.autowidth(60),
        height: (ScreenWidth-ScreenUtil.autowidth(60))*0.3024,
        marginHorizontal: ScreenUtil.autowidth(30),
        marginTop: ScreenUtil.autowidth(15),
        marginBottom: ScreenUtil.autowidth(10),
    },




    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: ScreenUtil.autoheight(5),
      paddingHorizontal: ScreenUtil.autowidth(40),

    },

   




    leftout: {
      paddingLeft: ScreenUtil.autowidth(15),
    },
    headleftimg: {
     
      width: ScreenUtil.autowidth(18),
      height: ScreenUtil.autowidth(18),
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    leftimg: {
        width: ScreenUtil.autowidth(14),
        height: ScreenUtil.autowidth(14),
        marginRight: ScreenUtil.autowidth(5),
    },
   
    explainimg: {
        width: ScreenUtil.autowidth(12),
        height: ScreenUtil.autowidth(12),
        marginRight: ScreenUtil.autowidth(5),
    },
    luckyimg: {
        width: ScreenUtil.autowidth(12),
        height: ScreenUtil.autowidth(14),
        marginRight: ScreenUtil.autowidth(5),
    },
    frontimg: {
        width: ScreenUtil.autowidth(14),
        height: ScreenUtil.autowidth(14),
        marginRight: ScreenUtil.autowidth(5),
    },
    inptout: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 3,
      //alignItems: "center",
      justifyContent: 'center',
      height: ScreenUtil.autoheight(25),
      marginHorizontal: ScreenUtil.autowidth(5),
      paddingHorizontal: ScreenUtil.autowidth(5),
    },
    inpt: {
      height: ScreenUtil.autoheight(45),
      fontSize: ScreenUtil.setSpText(12),
    },
    listItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    listInfo: {
      flex: 1,
      borderTopWidth:1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: ScreenUtil.autoheight(65),
      paddingHorizontal: ScreenUtil.autowidth(16),
    },
    scrollView: {
      flex: 1,
    },
    listInfoTitle: {
      fontSize: ScreenUtil.setSpText(16)
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    modalStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subView: {
      borderRadius: 5,
      borderWidth: 0.5,
      alignSelf: 'stretch',
      justifyContent: 'center',
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    buttonView: {
      alignItems: 'flex-end',
    },
    butclose: {
      width: ScreenUtil.autowidth(30),
      height: ScreenUtil.autowidth(30),
      fontSize: ScreenUtil.setSpText(28),
    },
    titleText: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: ScreenUtil.setSpText(18),
      marginBottom: ScreenUtil.autoheight(5),
    },
    passoutsource: {
      alignItems: 'center',
      flexDirection: 'column', 
      padding:  ScreenUtil.autowidth(10),
    },
    inptpass: {
      width: '100%',
      height: ScreenUtil.autoheight(45),
      fontSize: ScreenUtil.setSpText(16),
      marginVertical: ScreenUtil.autoheight(10),
      paddingHorizontal: ScreenUtil.autowidth(15),
    },
    copyout: {
      borderRadius: 3,  
      alignItems: 'center',
      justifyContent: 'center', 
      margin: ScreenUtil.autowidth(10), 
      height: ScreenUtil.autoheight(45), 
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16),
    },
    tab1:{
      flex:1,
    },
    tab2:{
      flex:1,
      flexDirection: 'column',
    }, 
    canceltext: {
      fontSize: ScreenUtil.setSpText(12),
    },
    prompttext: {
      fontSize: ScreenUtil.setSpText(12),
      lineHeight: ScreenUtil.autoheight(20),
    },
    btnout: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    manualout: {
        paddingTop: ScreenUtil.autowidth(40),
        paddingHorizontal: ScreenUtil.autowidth(35),
    },
    btnloginUser: {
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      width: ScreenUtil.autowidth(150),
      height: ScreenUtil.autoheight(45),
    },
    btntext: {
      fontSize: ScreenUtil.setSpText(17),
    },
    logout:{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: ScreenUtil.autoheight(20),
    },
    logimg: {
      width: ScreenUtil.autowidth(50), 
      height: ScreenUtil.autowidth(50),
    },
    logtext: {
      fontSize: ScreenUtil.setSpText(14),
      lineHeight: ScreenUtil.autoheight(30),
    },

    listViewStyle:{ 
        flex: 1,
        borderRadius: 10,
        alignItems:'center', 
        justifyContent: 'flex-start',
        marginVertical:ScreenUtil.autowidth(5), 
        paddingVertical: ScreenUtil.autowidth(8), 
        marginHorizontal: ScreenUtil.autowidth(10),
    }, 

    namelist: {
        alignItems:'center',
        justifyContent: 'center',
        marginHorizontal: ScreenUtil.autowidth(3),
        width: (ScreenWidth-ScreenUtil.autowidth(38))/3,
        height: (ScreenWidth-ScreenUtil.autowidth(38))/3*0.25,
    },


    ratiotext: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(18),
    },
})
export default OTCactivity;