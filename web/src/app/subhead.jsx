import React, {PropTypes} from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import { Provider,connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Immutable, {OrderedMap, Map, List} from 'Immutable';
import sendMsg from './ws/sendMsg'
import {
	addBranch,
	addGroup,
	disableAll
} from './action/actions';

const toobarStyle ={
	paddingLeft: 20
}
const paperStyle = {
	minWidth: "460px"
}
//二级导航
export default class SubHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openDialog: false
		}
	}
	componentDidMount() {
		document.body.addEventListener('keyup' (evt) => {
			
		}, false);
	}

	static propTypes = {
	  hosts: PropTypes.object.isRequired
	}

	static contextTypes = {
		dialog: PropTypes.func.isRequired,
		toast: PropTypes.func.isRequired
	}

	static defaultProps = {
		hosts: new Map()
	}

	//对话框相关事件
	handleCloseDialog() {
		this.setState({
			openDialog: false
		});
	}

	handleOpenDialog() {
		this.setState(Object.assign({}, this.state, {
			openDialog: true
		}));
	}

	handleChangeBranch(evt, val) {
		this.setState(Object.assign({}, this.state, {
			branchName: val
		}));	
	}

	handleGroupInput(inputVal, groups) {
		var result = groups.filter(current => current.text === inputVal);
		this.setState(Object.assign({}, this.state, {
			groupName: inputVal,
			groupId: result.length ? result[0].value : null
		}));
	}

	handleGroupSelect(val) {
		this.setState(Object.assign({}, this.state, {
			groupName: val.text,
			groupId: val.value
		}));
	}

	handleAddBranch() {
		let {groupName, branchName, groupId} = this.state;
		let {addGroup, addBranch} = this.props;
		if (groupName && branchName) {
			//groupid为null就新建分支
			addBranch(groupId, groupName, branchName);
			this.setState({
				openDialog: false
			});
		} else {
			this.context.dialog({
				msg: '分支名称和分组名称是必须得',
				layout: -1,
				btn: ["*确定"]
			});
		}
	}

	handleEnterKeyAddBranch(evt) {
		let {groupName, branchName} = this.state;
		if (groupName && branchName && evt.keyCode === 13) {
			this.handleAddBranch();
		}
	}

	//对话框相关事件结束
	
	//禁止全部
	handleDisAll() {
		this.props.disableAll();
	}
	//保存hosts
	handleSaveHosts() {
		var com = this;
		sendMsg.updateRule(this.props.hosts.toJS())
		.then(message => com.context.toast(message.result), 
			message => com.context.toast(message.result))
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.openDialog !== nextState.openDialog;      
	}

	renderDialog() {
		const contentStyle = {
			width: '500px',
			maxWidth: 'none',
			textAlign: 'center',
			overflow: "hidden"
		};
		const bodyStyle = {
			padding: "12px",
			minWidth: "200px"
		}
		const actions = [
			<FlatButton
				label="取消"
				primary={true}
				onTouchTap={this.handleCloseDialog.bind(this)}
			/>,
			<FlatButton
				label="保存"
				primary={true}
				keyboardFocused={true}
				onTouchTap={this.handleAddBranch.bind(this)} 
			/>
		];
		let source = this.groups = this.props.hosts.map((current, index) => {
			return {
				text: current.get('name'),
				value: index
			}
		}).toJS()
		return (<Dialog
			actions={actions}
			modal={true}
			open={this.state.openDialog}
			contentStyle={contentStyle}
			autoScrollBodyContent={true}
			bodyStyle={bodyStyle}
			>
				<AutoComplete
					floatingLabelText="分组名称"
					ref="grounEle"
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={source}
					maxSearchResults={5}
					openOnFocus={true}
					onUpdateInput = {this.handleGroupInput.bind(this)}
					onNewRequest={this.handleGroupSelect.bind(this)}
				/><br/>
				<TextField
					ref="branchEel"
					floatingLabelText="规则名称"
					type="text"
					onKeyUp = {this.handleEnterKeyAddBranch.bind(this)}
					onChange={this.handleChangeBranch.bind(this)}
				/>
		</Dialog>);
	}

	render() {
		return (
			<Paper zDepth={0} style={paperStyle}>
				<Toolbar style={toobarStyle}>
					<ToolbarGroup firstChild={false}>
						<ToolbarTitle text="操作" />
						<RaisedButton label="新建" primary={true} onClick={this.handleOpenDialog.bind(this)}/>
						<RaisedButton label="禁用全部" primary={true} onClick={this.handleDisAll.bind(this)}/>
					</ToolbarGroup>
					<ToolbarGroup>
						<RaisedButton label="保存" primary={true} onClick={this.handleSaveHosts.bind(this)}/>
					</ToolbarGroup>
				</Toolbar>
				{this.renderDialog()}
			</Paper>
		)
	}
}
function mapStateToProps(state) {
	return {
		hosts: state.get('hosts')
	}
}
function mapDispatchToProps(dispatch) {
	return {
		addBranch: bindActionCreators(addBranch, dispatch),
		addGroup: bindActionCreators(addGroup, dispatch),
		disableAll: bindActionCreators(disableAll, dispatch)
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(SubHeader);
